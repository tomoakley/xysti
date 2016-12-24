import React from 'react'
import {IndexRoute, Route} from 'react-router'
import {App, Home, Login, NotFound} from 'containers'

export default () => {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="login" component={Login}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  )
}
