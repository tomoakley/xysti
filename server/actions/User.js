import 'es6-promise'
import 'isomorphic-fetch'
import User from '../models/User'
import {verifyJwt, generateJwt} from '../../src/utils/jwt'
import {setCookieValue} from '../../src/utils/cookies'
import urlFormat from '../../src/utils/urlFormat'

export const getRefreshToken = (id, refreshToken) => {
  User.sync().then(() => {
    return User.findOrCreate({
      where: { user_id: id },
      defaults: { refresh_token: refreshToken },
    })
  })
}

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
      getRefreshToken(user_id, refresh_token)
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

export const authorize = (req, res) => {
  const {id} = req.body
  const {AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_SECRET} = process.env
  User.find({ where: {user_id: id} }).then(user => {
    const {refresh_token} = user.dataValues
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
        const {sub: user_id, email: emailAddress, picture, name, exp, iat, aud} = decoded
        generateJwt({user_id, exp, iat, aud}, AUTH0_SECRET, true, (err, token) => {
          if (err) console.log(err)
          else {
            req.session.user_id = user_id
            req.session.save()
            res.json({token, user_id, emailAddress, picture, name})
          }
        })
      })
    }).catch(err => res.json(`Delegation error: ${err}`))
  }).catch(error => console.log(`Sequelize error: ${error}`))
}

export const linkAccount = (req, res) => {
  console.log('session', req.session)
}

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
