import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import {reducer as reduxAsyncConnect} from 'redux-async-connect'

import user from './user'

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  user
})
