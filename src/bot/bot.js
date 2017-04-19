import builder, {UniversalBot, IntentDialog, EntityRecognizer} from 'botbuilder'
import {path, isEmpty, split} from 'ramda'
import 'isomorphic-fetch'
import ApiAiRecognizer from 'api-ai-recognizer'
import {BotAuthenticator} from 'botauth'
import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import config from '../config'
import {formatDatetime, parseDateTime, getUpcomingSessions} from 'utils/datetime'
import geocodeLocation from 'utils/geocodeLocation'
import server, {connector} from './server'
import urlFormat from 'utils/urlFormat'

const {
  api: {url: apiUrl},
  bot: {url: botUrl}
} = config

const app = server()
const bot = new UniversalBot(connector)

// set up api.ai
const apiai = new ApiAiRecognizer(process.env.APIAI_API_KEY)

// set up botauth and the providers
const ba = new BotAuthenticator(app, bot, { baseUrl: botUrl, secret: process.env.BOTAUTH_SECRET })
ba.provider('facebook', (options) => {
    console.log('options', options)
    return new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: options.callbackURL
    }, (accessToken, refreshToken, profile, done) => {
        profile = profile || {};
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        console.log('profile', profile)
        return done(null, profile);
    });
});

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

// Global Actions
bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

bot.dialog('/help', [(session) => {
  session.endDialog('Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.');
}])

const intents = new IntentDialog({ recognizers: [apiai] })

bot.dialog('/', intents
  .matches(/^profile/i, "/profile")
  .onDefault(session => session.endDialog('Sorry...can you please rephrase?'))
) // pass all messages through api.ai

bot.dialog('firstRun', [
  (session) => {
    const {
      message: {
        user: {name: fullName}
      }
    } = session
    session.userData.name = split(' ', fullName)
    session.userData.version = 1.0 // prevent re-triggering
    session.endDialog(`Hey ${session.userData.name}, I'm Xysti. I'm your personal assistant for helping you find sports sessions and facilities. Ask me 'where can I play {sport} tomorrow afternoon in {location}' to try me out. Say 'help' for more tips and information.`)
}
]).triggerAction({
  onFindAction: (context, callback) => {
      const {text} = context.message
      const regex = /^Get Started/i;
      const message = regex.test(text)
      const ver = context.userData.version || 0
      console.log('version', ver)
      const score = ver < 1.0 || message ? 1.1 : 0.0
      callback(null, score)
  },
  onInterrupted: function (session, dialogId, dialogArgs, next) {
    // Prevent dialog from being interrupted.
    session.send("Sorry... We need some information from you first.");
  }
});

bot.dialog("/profile", [].concat(
    ba.authenticate("facebook"),
    async (session, results) => {
      const {accessToken} = ba.profile(session, 'facebook')
      const pathname = 'https://graph.facebook.com/v2.8/me'
      const query = {
        redirect: 0,
        fields: 'id,first_name,location,age_range,gender'
      }
      try {
        const response = await fetch(urlFormat({pathname, query}), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${accessToken}`
          }
        })
        const {
          id,
          first_name: name,
          location: {name: defaultLocation},
          age_range: {min: minAge},
          gender
        } = await response.json()
        session.userData = {id, name, defaultLocation, minAge, gender}
        session.endDialog(`Hi ${name}, thanks for logging in!`)
      } catch (err) {
        console.log(err)
        session.endDialog('something went wrong, sorry')
      }
    }
  )
)

bot.on("account_linking_callback", data => {
    console.log(data);
})

const getEntities = (entities) => {
  const missingEntities = []
  Object.keys(entities).forEach(name => !entities[name].value ? missingEntities.push(name) : null)
  return missingEntities
}

bot.dialog('/collectEntities', [
  (session, args) => {
    const {missingEntities} = args
    session.dialogData.entities = args.entities
    session.dialogData.missingEntities = missingEntities
    if (missingEntities.length > 0) builder.Prompts.text(session, args.entities[missingEntities[0]].prompt)
    else session.replaceDialog('/findSession', session.dialogData.entities)
  },
  (session, results) => {
    const {missingEntities} = session.dialogData
    const missingEntity = missingEntities.shift()
    session.dialogData.entities[missingEntity].value = results.response
    session.dialogData.missingEntities = missingEntities
    if (missingEntities.length > 0) session.replaceDialog('/collectEntities', session.dialogData)
    else session.replaceDialog('/findSession', session.dialogData.entities)
  }
])

intents.matches('session.query', [
  (session, args) => {
    session.sendTyping();
    const {defaultLocation} = session.userData
    const sport = EntityRecognizer.findEntity(args.entities, 'sport')
    const location = EntityRecognizer.findEntity(args.entities, 'geo-city')
    const date = EntityRecognizer.findEntity(args.entities, 'date')
    const time = EntityRecognizer.findEntity(args.entities, 'time-period')
    session.dialogData.entities = {
      sport: { value: sport ? sport.entity : null, prompt: 'What sport do you want to play?' },
      location: { value: defaultLocation ? defaultLocation : location ? location.entity : null, prompt: 'Where did you want to do that?' },
      date: { value: date ? date.entity : null, prompt: 'When did you want to do that?' },
      time: { value: time ? time.entity.split('/') : null, prompt: 'What time do you want to do that?' }
    }
    session.dialogData.missingEntities = getEntities(session.dialogData.entities)
    session.replaceDialog('/collectEntities', session.dialogData)
  }
])

bot.dialog('/findSession', [
  async (session, args) => {
    session.sendTyping();
    const {sport, location, date, time} = args
    const {
      userData: {name, id: facebookId},
      message: {
        user: {name: fullName}
      }
    } = session
    const datetime = parseDateTime(date.value, time.value)
    const addDetailsToSession = (session, details) => { // eslint-disable-line no-shadow
      session.dialogData.sessionDetails = {...details}
      return session
    }
    const geoLocation = await geocodeLocation(location.value)
    const {lat, lng} = path(['results', 0, 'geometry', 'location'], geoLocation)
    fetch(`${apiUrl}/session/find`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: sport.value,
        lat, lng,
      })
    }).then(response => response.json())
    .then(data => {
      const {opportunities} = data
      const cards = []
      opportunities.forEach(opportunity => {
        const {title, address, website, id} = opportunity
        const buttons = [
          builder.CardAction.postBack(addDetailsToSession(session, {opportunityId: id, datetime: datetime.from}), 'Book this session', 'Book this session'),
          builder.CardAction.openUrl(session, `https://www.google.co.uk/maps?hl=en&q=${address}`, 'View on map')
        ]
        !isEmpty(website) ? buttons.push(builder.CardAction.openUrl(session, website, "Go to website")) : null
        cards.push(new builder.HeroCard(session)
          .title(title)
          .subtitle(`Address: ${address}`)
          .text(`Date: ${formatDatetime(datetime)}`)
          .buttons(buttons)
        )
      })
      console.log('opportunities', opportunities)
      if (opportunities.length > 0) {
        const carousel = new builder.Message(session)
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(cards)
        session.send(`I found ${opportunities.length > 1 ? 'these' : 'this'} for you, ${name || fullName}`)
        builder.Prompts.text(session, carousel)
      } else {
        session.endDialog(`Sorry ${name || fullName}, I couldn't find any ${sport.value} sessions for you. Is there anything else I can do for you?`)
      }
    }).catch(err => console.log(`ERROR: ${err}`))
  },
  (session, args) => session.replaceDialog('/bookSession', session.dialogData) // eslint-disable-line no-unused-vars
])

bot.dialog('/bookSession', [
  (session, results, next) => {
    const {id} = session.userData
    session.dialogData.sessionDetails = results.sessionDetails
    if (!id) session.beginDialog('/profile', session)
    else next()
  },
  (session, results) => {
    const {
      userData: {name, id: facebookId},
      dialogData: {sessionDetails}
    } = session
    fetch(`${apiUrl}/session/book`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...sessionDetails, facebookId})
    }).then(response => response.json())
      .then(details => session.endDialog(`Great choice, ${name}! I have booked that session for you. Is there anything else I can help with?`))
      .catch(err => {
        session.endDialog(`Hmm, something went wrong booking your session, ${name}. Try again and if it doesn't work again, contact us at [email]. Sorry!`)
        console.log(`Error booking session on chatbot: ${err}`)
      })
  }
])

intents.matches('sessions.showall', [
  async function(session, args) { // eslint-disable-line no-unused-vars, func-names
    const {name} = session.userData
    try {
      const userIdResponse = await fetch(`${apiUrl}/user/facebook/default-user`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      const {userId} = await userIdResponse.json()
      const sessionsResponse = await fetch(`${apiUrl}/sessions/list/${userId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      const sessions = await sessionsResponse.json()
      if (sessions && sessions.length > 0) {
        const upcoming = getUpcomingSessions(sessions)
        const cards = []
        upcoming.forEach(details => {
          const {title, location} = details
          const datetime = formatDatetime(details.datetime)
          cards.push(new builder.HeroCard(session)
            .title(title)
            .subtitle(`Location: ${location}`)
            .text(`Date: ${datetime}`)
          )
        })
        const msg = new builder.Message(session)
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(cards)
        session.send(msg)
        session.send(`You've got these coming up soon, ${name}. Is there anything else I can help with?`)
        session.endDialog()
      } else {
        session.send('Hmm, looks like you have no upcoming sessions booked right now.')
      }
    } catch (err) {
      console.log(err)
      session.send('Something went wrong, sorry about that.')
    }
  }
])
