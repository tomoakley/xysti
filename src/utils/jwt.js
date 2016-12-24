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
  return sign(payload, secret, {algorithm: 'HS256'}, cb)
}

// DO NOT USE if you don't trust where the message came from. Otherwise bad might happen...
export const decodeJwt = (token) => {
  return decode(token)
}
