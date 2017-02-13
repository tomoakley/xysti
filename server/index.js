import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import http from 'http'
import SocketIo from 'socket.io'
const RedisStore = require('connect-redis')(session)
import config from '../src/config'
import {authorize, login, linkAccount, auth0ManagementApiJwt, checkAuth} from './actions/User'
import {find, book, list} from './actions/Session'
import configureAuth from './configureAuth'

const app = express()
const server = new http.Server(app)

const io = new SocketIo(server);
io.path('/ws');

const {
  api: {
    host: apiHost,
    port: apiPort 
  }
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
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept")
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

configureAuth(app, config)

app.post('/user/authorize', authorize)
app.post('/user/link', linkAccount)
app.get('/user/checkAuth', checkAuth)
app.post('/session/find', find)
app.post('/session/book', book)
app.get('/sessions/list/:user_id', list)
app.get('/jwt', (req, res) => {
  res.json(auth0ManagementApiJwt(['read', 'update']))
})

if (apiPort) {
  const runnable = app.listen(apiPort, (err) => {
    if (err) console.error(err)
    console.info('----\n==> 🌎  Server is running on port %s', apiPort)
    console.info('==> 💻  Send requests to http://%s:%s', apiHost, apiPort)
  })

  io.on('connection', (socket) => {

    socket.on('history', () => {
      for (let index = 0; index < bufferSize; index++) {
        const msgNo = (messageIndex + index) % bufferSize;
        const msg = messageBuffer[msgNo];
        if (msg) {
          socket.emit('msg', msg);
        }
      }
    });

    socket.on('msg', (data) => {
      data.id = messageIndex;
      messageBuffer[messageIndex % bufferSize] = data;
      messageIndex++;
      io.emit('msg', data);
    });
  });
  io.listen(runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
