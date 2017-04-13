import 'isomorphic-fetch'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import FacebookStrategy from 'passport-facebook'
import config from '../src/config'
import {verifyJwt} from '../src/utils/jwt'
import {addRefreshToken, getUserById, auth0ManagementApiJwt, addFacebookID} from './actions/User'
import urlFormat from '../src/utils/urlFormat'

const configureAuth = (app) => {
  const {
    api: {url: apiUrl},
    app: {url: appUrl}
  } = config
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy(async (username, password, done) => { // eslint-lint-disable func-names
    const {AUTH0_CLIENT_ID, AUTH0_DOMAIN} = process.env
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
        const {sub: id, email, picture, name} = decoded
        addRefreshToken(id, refresh_token)
        return done(null, {id, email, picture, name})
      })
    } catch (err) {
      console.log(`FETCH ERROR: ${err}`)
      return done(null, false)
    }
  }))

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${apiUrl}/user/link/facebook/return`,
    passReqToCallback: true
  }, (req, accessToken, refreshToken, profile, done) => {
    const {user: userId} = req.session.passport
    const token = auth0ManagementApiJwt(['read', 'update'])
    const {AUTH0_DOMAIN} = process.env
    return fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${userId}/identities`, {
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
          console.error(`Error linking account ${userId} to Facebook: ${data.message}`)
          if (data.errorCode === 'identity_conflict') {
            addFacebookID(userId, profile.id)
            return done(null, {id: userId, facebook_id: profile.id})
          }
          return done(null, {id: userId}) // return the error message
        }
        return data.some(identity => {
          if (identity.provider === 'facebook') {
            addFacebookID(userId, profile.id)
            return done(null, {id: userId, facebook_id: identity.user_id}) // yes! it worked
          }
          return false
        })
      }).catch(err => console.log(`error linking facebook: ${err}`))
    } // eslint-disable-line indent
  ))

  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async(id, done) => {
    try {
      const user = await getUserById(id)
      done(null, user)
    } catch (err) {
      done(err, false)
    }
  })

  app.post('/login',
    passport.authenticate('local', {failureRedirect: '/loginfailed'}),
    (req, res) => res.json(req.user)
  )

  app.get('/login', (req, res) => res.redirect(`${appUrl}/profile`))
  app.get('/loginfailed', (req, res) => res.send('failed'))

  app.get('/user/link/facebook', passport.authenticate('facebook'))
  app.get('/user/link/facebook/return', passport.authenticate('facebook',
    { failureRedirect: '/loginfailed', successRedirect: '/login' }),
  )

  // bot auth routes
  app.get('/botauth/facebook', (req, res) => {
    const pathname = 'https://www.facebook.com/v2.8/dialog/oauth'
    const query = {
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: 'https://api.xysti.co/botauth/facebook/callback',
      state: req.query.state,
      scope: ['public_profile', 'email'],
      response_type: 'token'
    }
    const facebookUrl = urlFormat({pathname, query})
    res.redirect(facebookUrl)
  })

  app.get('/botauth/facebook/callback', (req, res) => {
    res.json({req})
  })
}

export default configureAuth
