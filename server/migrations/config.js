// migration config http://docs.sequelizejs.com/en/latest/docs/migrations/

const POSTGRES_CONNECTION = {
  url: 'postgres://Tom@localhost:5432/xysti', // TODO figure out how to make webpack build this so that process.env is included
  dialect: 'postgres'
}

module.exports = {
  development: POSTGRES_CONNECTION,
  production: POSTGRES_CONNECTION
}
