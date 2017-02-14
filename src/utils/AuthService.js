import 'es6-promise'
import 'isomorphic-fetch'
import urlFormat from './urlFormat'
import {generateJwt} from './jwt'

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


export const reauthenticate = async() => {
  try {
    const response = await fetch('http://localhost:3030/user/authorize', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
    return null
  }
}
