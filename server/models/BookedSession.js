import Sequelize from 'sequelize'
import database from '../database'

const BookedSession = database.define('BookedSession', {
  user_id: { type: Sequelize.STRING },
  session_id: { type: Sequelize.INTEGER },
  rating: { type: Sequelize.INTEGER }
}, {
  tableName: 'booked_sessions'
})

export default BookedSession
