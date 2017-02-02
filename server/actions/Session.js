import 'es6-promise'
import 'isomorphic-fetch'
import Session from '../models/Session'

export const create = (req, res) => {
  console.log(req.body)
  const {title, location, datetime} = req.body
  Session.findOrCreate({
    where: { title, location, datetime }
  }).spread((user, created) => res.json(user.get({plain: true})))
}
