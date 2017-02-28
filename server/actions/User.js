import 'es6-promise'
import 'isomorphic-fetch'
import {path} from 'ramda'
import User from '../models/User'
import {verifyJwt, generateJwt} from '../../src/utils/jwt'
import urlFormat from '../../src/utils/urlFormat'

/* getRefreshToken
 * Add the refresh token for the specified user into the database
 * Params: id - the main user id
 *         refreshToken - RF for the user id above
 * TODO This shouldn't be exported by configureAuth currently processes inline so needs it
 */
export const addRefreshToken = (id, refreshToken) => {
  User.sync().then(() => {
    return User.findOrCreate({
      where: { user_id: id },
      defaults: { refresh_token: refreshToken },
    })
  })
}

/* addFacebookID
 * Adds the facebook ID for the specified user into the database
 * Params: id - the main user id
 *         facebookId - FB id for the user above
 */
export const addFacebookID = (userId, facebookId) => {
  User.sync().then(() => {
    User.update(
      { facebook_id: facebookId },
      { where: { user_id: userId } }
    ).then(result => {
      console.log(result)
    }).catch(err => console.log(`Sequelize error: ${err}`))
  })
}

/* findUserByFacebookID
 * Given the facebook ID, return the main user ID
 * TODO potentially add a [fields] param so more fields can be returned
 */
export const findUserByFacebookID = (facebookId) => {
  return User.findOne({
    where: { facebook_id: facebookId }
  }).then(user => {
    const {user_id} = user.get({ plain: true })
    return user_id // eslint-disable-line camelcase
  }).catch(err => console.log(`Error finding User ID for ${facebookId}: ${err}`))
}

export const facebookGetUser = async(req, res) => {
  const {facebook_id} = req.params
  const userId = await findUserByFacebookID(facebook_id)
  res.json({userId})
}

/* login
 * Validates the supplied username and password with Auth0 and returns the user details
 * TODO currently unused because configureAuth is doing it inline
 */
export const login = async (username, password) => {
  const {AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_SECRET} = process.env
  try {
    const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/ro`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'client_id': AUTH0_CLIENT_ID,
        'username': username,
        'password': password,
        'connection': 'Username-Password-Authentication',
        'grant_type': 'password',
        'scope': 'openid offline_access profile',
        'device': 'browser',
        'id_token': ''
      })
    })
    const data = await response.json()
    const {id_token, refresh_token} = data
    return verifyJwt(id_token, (jwtErr, decoded) => {
      if (jwtErr) return jwtErr
      const {sub: user_id, email: emailAddress, picture, name, exp, iat, aud} = decoded
      addRefreshToken(user_id, refresh_token)
      return generateJwt({user_id, exp, iat, aud}, AUTH0_SECRET, true, (err, token) => {
        if (err) return {err}
        return {token, user_id, emailAddress, picture, name}
      })
    })
  } catch (err) {
    console.log(`FETCH ERROR: ${err}`)
    return {err}
  }
}

/* authorize
 * Authorizes a previously signed in user using the refresh token from the database
 * TODO Needs refactoring as very ineffecient
 */
export const authorize = (req, res) => {
  const userId = path(['session', 'passport', 'user'], req)
  if (userId) {
    const {AUTH0_DOMAIN, AUTH0_CLIENT_ID} = process.env
    User.findOne({ where: {user_id: userId} }).then(user => {
      const {refresh_token} = user.get({ plain: true })
      return fetch(`https://${AUTH0_DOMAIN}/delegation`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: AUTH0_CLIENT_ID,
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          refresh_token: refresh_token,
          scope: 'openid profile email'
        })
      })
      .then(response => response.json())
      .then(data => {
        const {id_token} = data
        return verifyJwt(id_token, (jwtErr, decoded) => {
          if (jwtErr) return jwtErr
          const {sub: user_id, email, picture, name} = decoded // eslint-disable-line no-shadow
          res.json({user_id, email, picture, name})
        })
      }).catch(err => res.json(`Delegation error: ${err}`))
    }).catch(error => console.log(`Sequelize error: ${error}`))
  } else {
    res.json({})
  }
}

/* linkAccount
 * Link an account to a provider using Auth0
 * TODO currently configureAuth does this inline
 */
export const linkAccount = (req, res) => {
  console.log('session', req.session)
  console.log('res', res)
}

/* auth0ManagementApiJwt
 * Return a JWT which can be used to access the Auth0 Management API
 * Params: scopes - array containing scopes for the API. e.g ['read', 'update']
 */
export const auth0ManagementApiJwt = (scopes) => {
  const {AUTH0_MANAGEMENT_API_KEY, AUTH0_MANAGEMENT_API_SECRET} = process.env
  const AUTH0_MANAGEMENT_API_PAYLOAD = {
    aud: AUTH0_MANAGEMENT_API_KEY,
    scopes: {
      users: {
        actions: scopes
      },
      user_idp_tokens: {
        actions: ['read']
      }
    },
    iat: new Date().valueOf(),
    jti: 'b75911da6844cbf4803f2ce293fb423e'
  }
  // TODO this should be asynchronous (i.e using a callback) but for some reason it simply returns undefined even though token is defined
  // ((err, token) => if (err) return err; return token)
  return generateJwt(
    AUTH0_MANAGEMENT_API_PAYLOAD,
    AUTH0_MANAGEMENT_API_SECRET,
    true
  )
}

/* getUserById
 * Return user details for supplied id
 * TODO Refactor so 'fields' is a param and can be changed depending on user needs
 */
export const getUserById = id => {
  const urlParams = {
    pathname: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
    query: {
      fields: 'user_id,email,picture,name,identities'
    }
  }
  const token = auth0ManagementApiJwt(['read'])
  return fetch(urlFormat(urlParams), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(response => response.json())
  .catch(err => console.log(`getUserById error: ${err}`))
}

/* GET checkAuth
 * Return the session details if they exist
 */
export const checkAuth = (req, res) => {
  const user_id = req.session.passport && req.session.passport.user ? req.session.passport.user : null // eslint-disable-line camelcase
  res.json({user_id})
}
