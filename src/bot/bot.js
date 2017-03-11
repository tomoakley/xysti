import builder, {ChatConnector, UniversalBot, IntentDialog, EntityRecognizer} from 'botbuilder'
import 'isomorphic-fetch'
import ApiAiRecognizer from 'api-ai-recognizer'
import config from '../config'
import {formatDatetime, parseDateTime, getUpcomingSessions} from '../utils/datetime'

const {
    url: apiUrl
} = config.api

export const connector = new ChatConnector({
  appId: process.env.MICROSOFT_BOT_FRAMEWORK_ID,
  appPassword: process.env.MICROSOFT_BOT_FRAMEWORK_SECRET
})

export const bot = new UniversalBot(connector)

// set up api.ai
const apiai = new ApiAiRecognizer(process.env.APIAI_API_KEY)
const intents = new IntentDialog({
  recognizers: [apiai]
})

intents.onDefault(session => session.send('Sorry...can you please rephrase?')) // default response

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

// Global Actions
bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

bot.dialog('/help', [(session) => {
  session.endDialog('Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.');
}])

bot.dialog('/', intents) // pass all messages through api.ai

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
    const sport = EntityRecognizer.findEntity(args.entities, 'sport')
    const location = EntityRecognizer.findEntity(args.entities, 'geo-city')
    const date = EntityRecognizer.findEntity(args.entities, 'date')
    const time = EntityRecognizer.findEntity(args.entities, 'time-period')
    session.dialogData.entities = {
      sport: { value: sport ? sport.entity : null, prompt: 'What sport do you want to play?' },
      location: { value: location ? location.entity : null, prompt: 'Where did you want to do that?' },
      date: { value: date ? date.entity : null, prompt: 'When did you want to do that?' },
      time: { value: time ? time.entity.split('/') : null, prompt: 'What time do you want to do that?' }
    }
    session.dialogData.missingEntities = getEntities(session.dialogData.entities)
    session.replaceDialog('/collectEntities', session.dialogData)
  }
])

bot.dialog('/findSession', [
  (session, args) => {
    const {sport, location, date, time} = args
    const datetime = parseDateTime(date.value, time.value)
    const addDetailsToSession = (session, details, facebookId) => { // eslint-disable-line no-shadow
      session.dialogData.sessionDetails = {...details, facebookId}
      return session
    }
    fetch(`${apiUrl}/session/find`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: sport.value,
        location: location.value,
        datetime: datetime.from
      })
    }).then(response => response.json())
    .then(data => {
      const {title, location} = data
      const datetime = formatDatetime(data.datetime)
      const msg = new builder.Message(session)
        .attachments([
          new builder.HeroCard(session)
            .title(title)
            .subtitle(`Location: ${location}`)
            .text(`Date: ${datetime}`)
            .buttons([builder.CardAction.postBack(addDetailsToSession(session, {...data}, '10205942258634763'), 'Book this session', 'Book this session')]) // TODO facebookId needs to be obtained from session data
        ]);
      builder.Prompts.text(session, msg)
    }).catch(err => console.log(`ERROR: ${err}`))
  },
  (session, args) => session.replaceDialog('/bookSession', session.dialogData) // eslint-disable-line no-unused-vars
])

bot.dialog('/bookSession', [
  (session, results) => {
    const {sessionDetails} = results
    fetch(`${apiUrl}/session/book`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...sessionDetails})
    }).then(response => response.json())
      .then(details => console.log('session', details))
      .catch(err => console.log(`Error booking session on chatbot: ${err}`))
    session.send('Great, I have booked that session for you! Is there anything else I can help with?')
  }
])

intents.matches('sessions.showall', [
  async function(session, args) { // eslint-disable-line no-unused-vars, func-names
    try {
      const userIdResponse = await fetch(`${apiUrl}/user/facebook/10205942258634763`, {
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
      } else {
        session.send('Hmm, looks like you have no upcoming sessions booked right now.')
      }
    } catch (err) {
      console.log(err)
      session.send('Something went wrong, sorry about that.')
    }
  }
])
