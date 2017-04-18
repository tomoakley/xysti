import restify from 'restify'
import {ChatConnector} from 'botbuilder'
import config from '../config'

const {
  bot: {
    port: botPort,
    host: botHost
  },
  api: { port: apiPort }
} = config

export const connector = new ChatConnector({
  appId: process.env.MICROSOFT_BOT_FRAMEWORK_ID,
  appPassword: process.env.MICROSOFT_BOT_FRAMEWORK_SECRET
})

export default function() {
  const server = restify.createServer();
  server.use(restify.bodyParser());
  server.use(restify.queryParser());

  server.post('/api/messages', connector.listen())
  server.listen(botPort, (err) => {
    if (err) console.error(`Server Error: ${err}`)
    else {
      console.info(`----\n==> ✅  Chatbot is running, talking to API server on ${apiPort}`)
      console.info(`==> 💻  Open http://${botHost}:${botPort} in an emulator to talk to the chatbot`)
    }
  })
  return server
}
