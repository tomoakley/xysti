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
    host: process.env.HOST,
    port: process.env.PORT,
    url: process.env.NODE_ENV === 'production' ? `https://${process.env.HOST}` : `http://${process.env.HOST}:${process.env.PORT}`,
    title: 'Xysti',
    description: 'On-demand sports and physical activity app'
  },
  bot: {
    host: process.env.BOT_HOST,
    port: process.env.BOT_PORT
  },
  api: {
    host: process.env.API_HOST,
    port: process.env.API_PORT,
    url: process.env.NODE_ENV === 'production' ? `https://${process.env.API_HOST}` : `http://${process.env.API_HOST}:${process.env.API_PORT}`
  }
}, environment);
