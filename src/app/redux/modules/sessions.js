import {complement, equals, path, pipe} from 'ramda'
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
  },
  [UNBOOK_SESSION]: function setUnbookSessionActionHandler({items}) {
    return {
      fetchState: FETCH_STATES.IS_FETCHING,
      items,
      error: null
    }
  },
  [UNBOOK_SESSION_SUCCESS]: function setUnbookSessionSuccessActionHandler(props) { // eslint-disable-line no-unused-vars
    return {
      fetchState: FETCH_STATES.FETCH_SUCCESSFUL,
      ...props
    }
  },
  [UNBOOK_SESSION_FAILURE]: function setUnbookSessionFailureActionHandler({items, error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      items,
      error
    }
  }
}

export default function sessionReducer(state = initialState, {type, ...actionProps}) {
  if (type in actionHandlers) return actionHandlers[type](actionProps)
  return state
}

/* Request Sessions asynchronous action handlers */

function requestSessions() {
  return {
    type: FETCH_SESSIONS
  }
}

export function receiveSessionsSuccess(items) {
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

function unbookSessionRequest(state) {
  const {items} = state.sessions
  return {
    type: UNBOOK_SESSION,
    items
  }
}

function unbookSessionSuccess(state, id) {
  const {items} = state.sessions
  const equalsId = (idToCompare) => equals(id, idToCompare)
  const newSessions = items.filter(pipe(path(['id']), complement(equalsId)))
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
    dispatch(unbookSessionRequest(getState()))
    try {
      dispatch(unbookSessionSuccess(getState(), sessionId))
    } catch (err) {
      console.error(err)
      dispatch(unbookSessionFailure(getState(), err))
    }
  }
}
