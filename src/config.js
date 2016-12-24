require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Xysti',
    description: 'On-demand sports and physical activity app',
    head: {
      titleTemplate: 'Xysti',
      meta: [
        {name: 'description', content: 'On-demand sports and physical activity app'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Xysti'},
        {property: 'og:image', content: ''},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Xysti'},
        {property: 'og:description', content: 'On-demand sports and physical activity app'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@tomoakley'},
        {property: 'og:creator', content: '@tomoakley'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  },

}, environment);
