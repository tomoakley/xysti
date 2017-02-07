import passport from 'passport'
import LocalStrategy from 'passport-local'
import FacebookStrategy from 'passport-facebook'
import {verifyJwt, generateJwt} from '../src/utils/jwt'
import {getRefreshToken, getUserById, auth0ManagementApiJwt, addFacebookID} from './actions/User'
import 'isomorphic-fetch'

const configureAuth = (app, config) => {

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy(async function(username, password, done) {
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
        const {sub: user_id, email, picture, name, exp, iat, aud} = decoded
        getRefreshToken(user_id, refresh_token)
        return done(null, {user_id, email, picture, name})
      })
    } catch (err) {
      console.log(`FETCH ERROR: ${err}`) 
      return done(null, false)
    }
  }))

  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3030/user/link/facebook/return',
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      const {user: user_id} = req.session.passport
      const token = auth0ManagementApiJwt(['read', 'update'])
      const {AUTH0_DOMAIN} = process.env
      return fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${user_id}/identities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: 'facebook',
          user_id: profile.id,
        })
      }).then(response => response.json())
        .then(data => {
          if (data.statusCode) {
            console.error(`Error linking account ${user_id} to Facebook: ${data.message}`)
            if (data.errorCode == 'identity_conflict') {
              addFacebookID(user_id, profile.id)
              return done(null, {user_id, facebook_id: profile.id}) 
            }
            return done(data.message, false) // return the error message
          } else {
            return data.some(identity => {
              if (identity.provider == 'facebook') {
                addFacebookID(user_id, profile.id)
                return done(null, {user_id, facebook_id: identity.user_id}) 
              } else {return false}
            })
            return done('empty provider', false) // shouldn't be able to get here, but if it does...
          }
        })
        .catch(err => console.log(`error linking facebook: ${err}`))
      }
  ))

  passport.serializeUser((user, done) => done(null, user.user_id))
  passport.deserializeUser(async(id, done) => {
    try {
      const user = await getUserById(id)
      console.log('deserialized user', user)
      done(null, user)
    } catch (err) {
      done(err, false) 
    }
  })

  app.post('/login',
    passport.authenticate('local', {failureRedirect: '/loginfailed'}),
    (req, res) => res.json(req.user)
  )

  app.get('/login', (req, res) => res.redirect('http://localhost:3000/profile'))
  app.get('/loginfailed', (req, res) => res.send('failed'))

  app.get('/user/link/facebook', passport.authenticate('facebook'))
  app.get('/user/link/facebook/return', passport.authenticate('facebook', 
    { failureRedirect: '/loginfailed', successRedirect: '/login' }),
  )

}

export default configureAuth
