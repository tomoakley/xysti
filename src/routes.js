import React from 'react'
import {IndexRoute, Route} from 'react-router'
import {App, Home, Login, NotFound, Profile} from 'containers'
import FETCH_STATES from 'utils/redux/FETCH_STATES'

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    const {
      user: {fetchState}
    } = store.getState()
    if (fetchState === FETCH_STATES.INIT) {
      replace('/')
    } else if (fetchState === FETCH_STATES.IS_FETCHING) {
      return false
    }
    cb()
  }
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="login" component={Login} />

      <Route onEnter={requireLogin}>
        <Route path="profile" component={Profile} />
      </Route>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  )
}
