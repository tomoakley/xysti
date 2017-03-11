require('babel-polyfill');

// DO NOT call this file directly (e.g require('../config'))
// Instead use Redux and get the 'config' object from state

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  app: {
    host: process.env.HOST || 'http://localhost',
    port: process.env.PORT,
    title: 'Xysti',
    description: 'On-demand sports and physical activity app'
  },
  bot: {
    host: process.env.BOT_HOST || 'http://localhost',
    port: process.env.BOT_PORT
  },
  api: {
    host: process.env.API_HOST || 'http://localhost',
    port: process.env.API_PORT
  }
}, environment);
