import Sequelize from 'sequelize'
import database from '../database'

const BookedSession = database.define('BookedSession', {
  user_id: { type: Sequelize.STRING },
  session_id: { type: Sequelize.STRING },
  rating: { type: Sequelize.INTEGER },
  datetime: { type: Sequelize.DATE }
}, {
  tableName: 'booked_sessions'
})

export default BookedSession
