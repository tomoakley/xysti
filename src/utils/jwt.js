import {verify, sign, decode} from 'jsonwebtoken'

export const verifyJwt = (token, cb) => {
  return verify(
    token,
    new Buffer(process.env.AUTH0_SECRET, 'base64'),
    { algorithms: ['HS256'], audience: process.env.AUTH0_CLIENT_ID },
    cb
  )
}

export const generateJwt = (payload, secret, base64Encoded, cb) => {
  if (base64Encoded) secret = new Buffer(secret, 'base64') // eslint-disable-line no-param-reassign
  return sign(payload, secret, {algorithm: 'HS256'}, cb || null)
}

// DO NOT USE if you don't trust where the message came from. Otherwise bad might happen...
export const decodeJwt = token => {
  return decode(token)
}

export const getJwtExpirationDate = (token) => {
  const decoded = decodeJwt(token)
  if (!decoded.exp) return null
  const date = new Date(0)
  date.setUTCSeconds(decoded.exp)
  return date
}

export const isJwtExpired = (token) => {
  const date = getJwtExpirationDate(token)
  const offsetSecs = 0
  if (date === null) return false
  return !(date.valueOf() > (new Date().valueOf() + (offsetSecs * 1000)))
}
