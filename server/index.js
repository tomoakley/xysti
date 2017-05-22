import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
const RedisStore = require('connect-redis')(session)
import config from '../src/config'
import {authorize, linkAccount, auth0ManagementApiJwt, checkAuth, facebookGetUser, signup} from './actions/User'
import {find, book, list, remove, rate} from './actions/Session'
import configureAuth from './configureAuth'

const app = express()

const {
  api: {
    host: apiHost,
    port: apiPort,
  },
  bot: { url: botUrl },
  app: { url: appUrl }
} = config

app.use(session({
  secret: 'react and redux',
  resave: true,
  saveUnitialized: true,
  secure: false,
  store: new RedisStore({host: 'localhost', port: 6379})
}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  const ALLOWED_ORIGINS = [appUrl, botUrl]
  const ORIGIN = req.headers.origin
  if (ALLOWED_ORIGINS.indexOf(ORIGIN) > -1) res.header('Access-Control-Allow-Origin', ORIGIN)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

configureAuth(app)

app.post('/user/signup', signup)
app.post('/user/authorize', authorize)
app.post('/user/link', linkAccount)
app.get('/user/checkAuth', checkAuth)
app.get('/user/facebook/:facebook_id', facebookGetUser)
app.post('/session/find', find)
app.post('/session/book', book)
app.get('/session/rate/:session_id/:user_id/:rating', rate)
app.get('/sessions/list/:user_id', list)
app.delete('/sessions/delete/:user_id/:session_id', remove)
app.get('/jwt', (req, res) => {
  res.json(auth0ManagementApiJwt(['read', 'update']))
})

if (apiPort) {
  app.listen(apiPort, (err) => {
    if (err) console.error(err)
    console.info('----\n==> 🌎  Server is running on port %s', apiPort)
    console.info('==> 💻  Send requests to http://%s:%s', apiHost, apiPort)
  })
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
