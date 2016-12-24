import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import http from 'http'
import SocketIo from 'socket.io'
import config from '../src/config'
import {authorize, login} from './actions/User'

const app = express()
const server = new http.Server(app)

const io = new SocketIo(server);
io.path('/ws');

const {apiPort, apiHost} = config

app.use(session({
  secret: 'react and redux',
  resave: false,
  saveUnitialized: false,
  cookie: { maxAge: 6000 }
}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.post('/user/login', login)
app.post('/user/authorize', authorize)

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
