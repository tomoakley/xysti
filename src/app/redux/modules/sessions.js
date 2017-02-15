import {remove} from 'ramda'
import FETCH_STATES from 'utils/redux/FETCH_STATES'
import {fetchSessionList} from 'utils/sessions'

const FETCH_SESSIONS = 'xysti/sessions/FETCH_SESSIONS'
const FETCH_SESSIONS_SUCCESS = 'xysti/sessions/FETCH_SESSIONS_SUCCESS'
const FETCH_SESSIONS_FAILURE = 'xysti/sessions/FETCH_SESSIONS_FAILURE'
const UNBOOK_SESSION = 'xysti/sessions/UNBOOK_SESSION'
const UNBOOK_SESSION_SUCCESS = 'xysti/sessions/UNBOOK_SESSION_SUCCESS'
const UNBOOK_SESSION_FAILURE = 'xysti/sessions/UNBOOK_SESSION_FAILURE'

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
  [FETCH_SESSIONS_SUCCESS]: function setSessionsSuccessActionHandler(state, {items, error}) {
    return {
      fetchState: FETCH_STATES.FETCH_SUCCESSFUL,
      items,
      error
    }
  },
  [FETCH_SESSIONS_FAILURE]: function setSessionsFailureActionHandler(state, {error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      items: [],
      error
    }
  },
  [UNBOOK_SESSION]: function setUnbookSessionActionHandler(state) {
    return {
      fetchState: FETCH_STATES.IS_FETCHING,
      items: state.items,
      error: null
    }
  },
  [UNBOOK_SESSION_SUCCESS]: function setUnbookSessionSuccessActionHandler(state, {id}) {
    const {items} = state
    let newSessions
    for (let i = 0; i < items.length; i++) { // eslint-disable-line id-length
      if (items[i].id === id) {
        newSessions = remove(i, 1, items)
      }
    }
    return {
      fetchState: FETCH_STATES.FETCH_SUCCESSFUL,
      items: newSessions,
      error: null
    }
  },
  [UNBOOK_SESSION_FAILURE]: function setUnbookSessionFailureActionHandler(state, {error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      items: state.items,
      error
    }
  }
}

export default function sessionReducer(state = initialState, {type, ...actionProps}) {
  if (type in actionHandlers) return actionHandlers[type](state, actionProps)
  return state
}

/* Request Sessions asynchronous action handlers */

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

/* Unbook session asynchronous action handlers */

function unbookSessionRequest() {
  return {
    type: UNBOOK_SESSION
  }
}

function unbookSessionSuccess(state, id) {
  const {items} = state.sessions
  let newSessions
  for (let i = 0; i < items.length; i++) { // eslint-disable-line id-length
    if (items[i].id === id) {
      newSessions = remove(i, 1, items)
    }
  }
  console.log('newsessions', newSessions)
  return {
    type: UNBOOK_SESSION_SUCCESS,
    items: newSessions,
    error: null
  }
}

function unbookSessionFailure(state, {error}) {
  return {
    type: UNBOOK_SESSION_FAILURE,
    items: state.sessions.items,
    error
  }
}

export function unbookSession(sessionId) {
  return function _unbookSession(dispatch, getState) {
    dispatch(unbookSessionRequest())
    try {
      dispatch(unbookSessionSuccess(getState(), sessionId))
    } catch (err) {
      console.log(err)
      dispatch(unbookSessionFailure(getState(), err))
    }
  }
}
