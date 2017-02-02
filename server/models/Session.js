import Sequelize from 'sequelize'
import database from '../database'

const Session = database.define('Session', {
  title: { type: Sequelize.STRING },
  datetime: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING }
}, {
  tableName: 'sessions'
})

export default Session
