import builder, {ChatConnector, UniversalBot, IntentDialog, EntityRecognizer} from 'botbuilder'
import 'isomorphic-fetch'
import apiAiRecognizer from 'api-ai-recognizer'
import config from '../src/config'
import parseDateTime from './utils/datetime/parse'

export const connector = new ChatConnector({
  appId: process.env.MICROSOFT_BOT_FRAMEWORK_ID,
  appPassword: process.env.MICROSOFT_BOT_FRAMEWORK_SECRET
})

export const bot = new UniversalBot(connector)

// set up api.ai
const apiai = new apiAiRecognizer(process.env.APIAI_API_KEY)
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
  session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
}])

bot.dialog('/', intents) // pass all messages through api.ai

const getEntities = (entities) => {
  const missingEntities = []
  Object.keys(entities).forEach(name => !entities[name].value ? missingEntities.push(name) : null)
  return missingEntities
}

bot.dialog('/collectEntities', [
  (session, args) => {
    console.log('args', args)
    const {missingEntities} = args
    session.dialogData.entities = args.entities
    session.dialogData.missingEntities = missingEntities
    missingEntities.length > 0 ? builder.Prompts.text(session, args.entities[missingEntities[0]].prompt) : session.replaceDialog('/findSession', session.dialogData.entities)
  },
  (session, results) => {
    const {missingEntities} = session.dialogData
    const missingEntity = missingEntities.shift()
    session.dialogData.entities[missingEntity].value = results.response
    session.dialogData.missingEntities = missingEntities
    missingEntities.length > 0 ? session.replaceDialog('/collectEntities', session.dialogData) : session.replaceDialog('/findSession', session.dialogData.entities) 
  }
])

intents.matches('book.session', [
  (session, args) => {
    console.log('entities', args)
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
    console.log(JSON.stringify({
      sport: sport.value,
      location: location.value,
      datetime: datetime.from 
    }))
    fetch(`http://${config.apiHost}:${config.apiPort}/session/create`, {
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
      var msg = new builder.Message(session)
        .attachments([
          new builder.HeroCard(session)
            .title(data.title)
            .subtitle(`${data.title} session in ${data.location} at ${data.datetime}`)
            .images([
                builder.CardImage.create(session, 'http://cache2.asset-cache.net/xt/467826952.jpg?v=1&g=fs2|0|editorial186|26|952&s=1&b=NA==')
            ])
            .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
        ]);
        session.send(msg); 
    }).catch(err => console.log(`ERROR: ${err}`))
  }
])
