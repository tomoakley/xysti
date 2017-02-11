import express from 'express'
import config from '../config'
import {connector} from './bot'

const app = express()
const {botPort, botHost, apiPort} = config
app.post('/api/messages', connector.listen())
app.listen(botPort, (err) => {
  if (err) console.error(`Server Error: ${err}`)
  else {
    console.info(`----\n==> ✅  Chatbot is running, talking to API server on ${apiPort}`)
    console.info(`==> 💻  Open http://${botHost}:${botPort} in an emulator to talk to the chatbot`)
  }
})



