import FETCH_STATES from 'utils/redux/FETCH_STATES'
import {fetchSessionList} from 'utils/sessions'

const FETCH_SESSIONS = 'xysti/sessions/FETCH_SESSIONS'
const FETCH_SESSIONS_SUCCESS = 'xysti/sessions/FETCH_SESSIONS_SUCCESS'
const FETCH_SESSIONS_FAILURE = 'xysti/sessions/FETCH_SESSIONS_FAILURE'

const initialState = {
  fetchState: FETCH_STATES.INIT,
  items: [],
  error: null
}

const actionHandlers = {
  [FETCH_SESSIONS]: function setSessionsActionHandler() {
    return {
      fetchState: FETCH_STATES.IS_FETCHING,
      items: [],
      error: null
    }
  },
  [FETCH_SESSIONS_SUCCESS]: function setSessionsSuccessActionHandler({items, error}) {
    return {
      fetchState: FETCH_STATES.FETCH_SUCCESSFUL,
      items,
      error
    }
  },
  [FETCH_SESSIONS_FAILURE]: function setSessionsFailureActionHandler({error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      items: [],
      error
    }
  }
}

export default function sessionReducer(state = initialState, {type, ...actionProps}) {
  if (type in actionHandlers) return actionHandlers[type](actionProps)
  return state
}

function requestSessions() {
  return {
    type: FETCH_SESSIONS
  }
}

export function receiveSessionsSuccess(items) {
  console.log('receiveSessionsSuccess', items)
  return {
    type: FETCH_SESSIONS_SUCCESS,
    items,
    error: null
  }
}

function receiveSessionsFailure({error}) {
  return {
    type: FETCH_SESSIONS_FAILURE,
    items: [],
    error
  }
}

export function fetchSessions(userId) {
  return function _fetchSessions(dispatch) {
    dispatch(requestSessions())
    return fetchSessionList(userId)
      .then(sessionList => dispatch(receiveSessionsSuccess(sessionList)))
      .catch(err => dispatch(receiveSessionsFailure(err)))
  }
}
