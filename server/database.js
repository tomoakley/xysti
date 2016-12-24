import Sequelize from 'sequelize'

const database = new Sequelize(
  process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    omitNull: true,
  }
)

export default database
