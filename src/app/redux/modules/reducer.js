import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import {reducer as reduxAsyncConnect} from 'redux-async-connect'

import user from './user'
import sessions from './sessions'
import appFactory from './app'

export default function reducerFactory({config}) {
  return combineReducers({
    config: appFactory({config}),
    routing: routerReducer,
    reduxAsyncConnect,
    user,
    sessions
  })
}
