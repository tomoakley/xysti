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
  }).spread(session => {
    const {id} = session.get({ plain: true }) // eslint-disable-line no-param-reassign
    return id
  })
  const userID = await findUserByFacebookID(facebookId)
  const bookedSession = await BookedSession.create({
    session_id: sessionID, user_id: userID
  }).then(session => session.get({ plain: true }))
    .catch(err => {
      return err
    })
  res.json({...bookedSession})
}

/* DELETE /session/:user_id/:session_id
 * Delete a booked session
 */
export const remove = async(req, res) => {
  const {user_id, session_id} = req.params
  const rowsAffected = BookedSession.destroy({ where: {user_id, session_id}, limit: 1 })
  rowsAffected.then(rows => res.json({rows, session_id}))
}

/* GET sessions/list/:user_id
 * List all sessions booked by user_id
 */
export const list = async(req, res) => {
  const {user_id} = req.params
  try {
    const sessions = await BookedSession.findAll({ where: { user_id } })
    const sessionIds = []
    sessions.forEach(session => sessionIds.push(session.session_id))
    const getSessionDetails = async (id) => {
      const sessionRating = await BookedSession.findOne({
        where: { user_id, session_id: id }
      }).then(details => {
        const {rating} = details.get({ plain: true })
        return rating
      }).catch(err => console.log(err))
      const sessionDetails = await Session.findOne({
        where: { id }
      }).then(session => session.get({ plain: true }))
      return {...sessionDetails, rating: sessionRating}
    }
    const results = Promise.all(sessionIds.map(getSessionDetails))
    results.then(details => res.json(details))
  } catch (err) {
    console.log(err)
    res.json({err})
  }
}

/* GET /session/rate/:session_id/:user_id/:rating
 * Rate a session
 * TODO make sure only sessions which are in the past can be rated
 */

export const rate = async (req, res) => {
  const {session_id, user_id, rating} = req.params
  BookedSession.update(
    { rating },
    { where: { session_id, user_id } }
  ).then(result => {
    res.json({...result})
  }).catch(err => res.json({err}))
}
