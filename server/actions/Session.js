import 'es6-promise'
import 'isomorphic-fetch'
import {path} from 'ramda'
import Session from '../models/Session'
import BookedSession from '../models/BookedSession'
import {findUserByFacebookID} from './User'
import urlFormat from '../../src/utils/urlFormat'

/* POST /sessions/find/
 * Find sessions in the locality
 * Body: title, location, datetime
 * TODO change this to a GET request
 */
export const find = async (req, res) => {
  const {title, lat, lng} = req.body
  const activity = title[0].toUpperCase() + title.slice(1)
  const pathname = 'https://imin-platform-api.imin.co/alpha/opportunities/search'
  const query = {
    activity,
    lat, lng,
    radius: 4,
    source: 'static'
  }
  const url = urlFormat({pathname, query})
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Accept': 'application/json'
      }
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.log(err)
  }
}

/* POST /session/book/
 * Book a session
 * Body: title, location, datetime, facebookId
 */
export const book = async(req, res) => {
  console.log('book', req.body)
  const {opportunityId, facebookId, datetime} = req.body
  const userId = await findUserByFacebookID(facebookId)
  console.log('session id', opportunityId)
  const bookedSession = await BookedSession.create({
    session_id: opportunityId, user_id: userId, datetime
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
  const sessionIds = await BookedSession.findAll({
    where: { user_id }
  }).then(sessions => {
    var session_ids = []
    sessions.forEach(session => {
      session_ids.push(session.session_id)
    })
    return session_ids
  }).catch(err => reject(err))
  try {
    const getSessionDetails = async (id) => {
      const sessionRating = await BookedSession.findOne({
        where: { user_id, session_id: id }
      }).then(details => {
        details = details.get({ plain: true })
        return {rating: details.rating, datetime: details.datetime}
      }).catch(err => console.log(err))
      const sessionDetails = await fetch(`https://imin-platform-api.imin.co/alpha/opportunities/get/${id}`, {
        method: 'GET',
        headers: {
          'Content-Types': 'application/json',
          'Accept': 'application/json'
        }
      }).then(response => response.json())
      return {...sessionDetails, ...sessionRating}
    }
    const results = Promise.all(sessionIds.map(getSessionDetails))
    results.then(details => res.json(details)).catch(err => console.log(err))
  } catch (err) {
    console.log(err)
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
