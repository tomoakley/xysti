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

const DOMAIN_TLD = environment === 'production' ? 'co' : 'dev'

module.exports = Object.assign({
  app: {
    host: `app.xysti.${DOMAIN_TLD}`,
    port: process.env.PORT,
    url: `https://app.xysti.${DOMAIN_TLD}`,
    title: 'Xysti',
    description: 'On-demand sports and physical activity app'
  },
  bot: {
    host: `bot.xysti.${DOMAIN_TLD}`,
    port: process.env.BOT_PORT,
    url: `https://bot.xysti.${DOMAIN_TLD}`
  },
  api: {
    host: `api.xysti.${DOMAIN_TLD}`,
    port: process.env.API_PORT,
    url: `https://api.xysti.${DOMAIN_TLD}`
  }
}, environment);
