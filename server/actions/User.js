import 'es6-promise'
import 'isomorphic-fetch'
import User from '../models/User'
import {verifyJwt, generateJwt} from '../../src/utils/jwt'

const getRefreshToken = (id, refreshToken) => {
  User.sync().then(() => {
    return User.findOrCreate({
      where: { user_id: id },
      defaults: { refresh_token: refreshToken },
    })
  })
}

export const login = (req, res) => {
  const {AUTH0_CLIENT_ID, AUTH0_DOMAIN, AUTH0_SECRET} = process.env
  const {email, password} = req.body
  return fetch(`${AUTH0_DOMAIN}/oauth/ro`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_id': AUTH0_CLIENT_ID,
      'username': email,
      'password': password,
      'connection': 'Username-Password-Authentication',
      'grant_type': 'password',
      'scope': 'openid offline_access profile',
      'device': 'browser',
      'id_token': ''
    })
  })
  .then(response => response.json())
  .then(json => {
    const {id_token, refresh_token} = json
    return verifyJwt(id_token, (jwtErr, decoded) => {
      if (jwtErr) return jwtErr
      const {sub: user_id, email: emailAddress, picture, name, exp, iat, aud} = decoded
      getRefreshToken(user_id, refresh_token)
      const payload = {
        user_id,
        exp,
        iat,
        aud
      }
      generateJwt(payload, AUTH0_SECRET, true, (err, token) => {
        if (err) return err
        res.json({token, user_id, emailAddress, picture, name})
      })
    })
  }) 
}

export const authorize = (req, res) => {
  const {id} = req.body
  const {AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_SECRET} = process.env
  User.find({ where: {user_id: id} }).then(user => {
    const {refresh_token} = user.dataValues
    return fetch(`${AUTH0_DOMAIN}/delegation`, {
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
        const payload = {user_id, exp, iat, aud}
        generateJwt(payload, AUTH0_SECRET, true, (err, token) => {
          if (err) console.log(err)
          else res.json({token, user_id, emailAddress, picture, name})
        })
      })
    }).catch(err => res.json(`Delegation error: ${err}`))
  }).catch(error => console.log(`Sequelize error: ${error}`))
}
