import {ChatConnector} from 'botBuilder'
import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
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

export const server = () => {
  const app = express()

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use(session({
    secret: 'botauthsecret',
    resave: true,
    saveUnitialized: true,
    secure: false
  }))

  app.post('/api/messages', connector.listen())
  app.listen(botPort, (err) => {
    if (err) console.error(`Server Error: ${err}`)
    else {
      console.info(`----\n==> ✅  Chatbot is running, talking to API server on ${apiPort}`)
      console.info(`==> 💻  Open http://${botHost}:${botPort} in an emulator to talk to the chatbot`)
    }
  })
  return app
}
