import Sequelize from 'sequelize'
import database from '../database'

const User = database.define('User', {
  user_id: { type: Sequelize.STRING },
  refresh_token: { type: Sequelize.STRING },
  facebook_id: { type: Sequelize.STRING }
}, {
  tableName: 'users'
})

export default User
