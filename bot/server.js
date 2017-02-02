import express from 'express'
import config from '../src/config'
import {connector} from './bot'

const app = express()
const {botPort, botHost} = config
app.post('/api/messages', connector.listen())
app.listen(botPort, (err) => {
  if (err) console.log(`Server Error: ${err}`)
  else console.log(`Chatbot listening on http://${botHost}:${botPort}`) 
})



