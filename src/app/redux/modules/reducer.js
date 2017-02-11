import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import {reducer as reduxAsyncConnect} from 'redux-async-connect'

import user from './user'
import appFactory from './app'

export default function reducerFactory({config}) {
  return combineReducers({
    app: appFactory({config}),
    routing: routerReducer,
    reduxAsyncConnect,
    user
  })
}
