import 'es6-promise'
import 'isomorphic-fetch'
import Session from '../models/Session'
import BookedSession from '../models/BookedSession'
import {findUserByFacebookID} from './User'

/* POST /sessions/find/
 * Find sessions in the locality
 * Body: title, location, datetime
 * TODO change this to a GET request
 */
export const find = (req, res) => {
  const {title, location, datetime} = req.body
  // right now this is just going to return the same params as above
  // soon I will change it to use Google Places API or similar ({imin}!) to find a gym/leisure centre nearby
  // also need to figure out how to get appropriate images. Getty Images API?
  res.json({title, location, datetime})
}

/* POST /session/book/
 * Book a session
 * Body: title, location, datetime, facebookId
 */
export const book = async(req, res) => {
  const {title, location, datetime, facebookId} = req.body
  const sessionID = await Session.findOrCreate({
    where: { title, location, datetime }
  }).spread((session, created) => {
    session = session.get({ plain: true })
    return session.id 
  })
  const userID = await findUserByFacebookID(facebookId)
  const bookedSession = await BookedSession.create({
    session_id: sessionID, user_id: userID
  }).then((session, created) => session.get({ plain: true }))
    .catch(err => {err})
  res.json({...bookedSession})
}

/* GET sessions/list/:user_id
 * List all sessions booked by user_id
 */ 
export const list = async(req, res) => {
  const {user_id} = req.params
  const sessionIds = await BookedSession.findAll({
    where: { user_id } 
  }).then(sessions => {
    var session_ids = []
    sessions.forEach(session => {
      session_ids.push(session.session_id) 
    })
    return session_ids
  }).catch(err => reject(err))
  const getSessionDetails = (id) => {
    return Session.findOne({
      where: { id }   
    }).then(session => session.get({ plain: true }))
  }
  const results = Promise.all(sessionIds.map(getSessionDetails))
  results.then(details => res.json(details))
}
