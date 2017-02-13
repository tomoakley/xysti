import 'es6-promise'
import 'isomorphic-fetch'
import {setCookieValue, removeCookie, getCookieValue} from './cookies.js'
import urlFormat from './urlFormat'
import {generateJwt, decodeJwt} from './jwt'

export const getProfile = idToken => {
  return fetch(`${process.env.AUTH0_DOMAIN}/tokeninfo`, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id_token: idToken
    })
  })
  .then(response => response.json())
  .catch(error => console.log(`Error getting profile data: ${error}`))
}

export const getUserById = id => {
  const AUTHO_MANAGEMENT_API_PAYLOAD = {
    'aud': process.env.AUTH0_MANAGEMENT_API_KEY,
    'scopes': {
      'users': {
        'actions': ['read']
      },
      'user_idp_tokens': {
        'actions': ['read']
      }
    },
    'iat': new Date().valueOf(),
    'jti': 'b75911da6844cbf4803f2ce293fb423e'
  }

  const urlParams = {
    pathname: `${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
    query: {
      fields: 'email'
    }
  }

  return generateJwt(
    AUTHO_MANAGEMENT_API_PAYLOAD,
    process.env.AUTH0_MANAGEMENT_API_SECRET,
    true,
    (err, token) => {
      return fetch(urlFormat(urlParams), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(response => response.json())
    }
  )
}

/* export const decodeIdToken = idToken => {
  return fetch(`${process.env.AUTH0_DOMAIN}/tokeninfo`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id_token': idToken
    })
  })
} */


export const reauthenticate = () => {
  return getCookieValue('id_token').then(idToken => {
    if (!idToken) return false
    const {user_id} = decodeJwt(idToken)
    return fetch(`/api/user/authorize`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: user_id
      })
    })
    .then(response => response.json())
    .then(data => {
      const {token: id_token, user_id, emailAddress, picture, name} = data // eslint-disable-line no-shadow
      setCookieValue('id_token', id_token)
      return {id_token, user_id, emailAddress, picture, name}
    }).catch(err => console.log(`Reauthentication error: ${err}`))
  }).catch(error => console.log(`Cookie error: ${error}`))
}

export const isLoggedIn = async() => {
  console.log('isLoggedIn!')
  try {
    const userIdResponse = await fetch('http://localhost:3030/user/checkAuth', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    const userId = await userIdResponse.json()
    const authorizeResponse = await fetch('http://localhost:3030/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: userId.user_id
      })
    })
    const authorized = await authorizeResponse.json()
    return authorized
  } catch (err) {
    console.log(err)
    return null
  }
}

export const logout = () => {
  removeCookie('id_token')
}
