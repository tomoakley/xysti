import FETCH_STATES from 'utils/redux/FETCH_STATES'

const FETCH_USER_DETAILS = 'xysti/user/FETCH_USER_DETAILS'
const FETCH_USER_DETAILS_SUCCESS = 'xysti/user/FETCH_USER_DETAILS_SUCCESS'
const FETCH_USER_DETAILS_FAILURE = 'xysti/user/FETCH_USER_DETAILS_FAILURE'
const REMOVE_USER_DETAILS_SUCCESS = 'xysti/user/REMOVE_USER_DETAILS_SUCCESS'
const REMOVE_USER_DETAILS_FAILURE = 'xysti/user/REMOVE_USER_DETAILS_FAILURE'

const initialState = {
  fetchState: FETCH_STATES.INIT,
  id: null,
  email: null,
  name: null,
  picture: null,
  error: null
}

const actionHandlers = {
  [FETCH_USER_DETAILS]: function setUserDetailsActionHandler() {
    return {
      fetchState: FETCH_STATES.IS_FETCHING,
      id: null,
      email: null,
      name: null,
      picture: null,
      error: null
    }
  },
  [FETCH_USER_DETAILS_SUCCESS]: function setUserDetailsSuccessActionHandler({id, email, name, picture}) {
    return {
      fetchState: FETCH_STATES.FETCH_SUCCESSFUL,
      id,
      email,
      name,
      picture,
      error: null
    }
  },
  [FETCH_USER_DETAILS_FAILURE]: function setUserDetailsFailureActionHandler({error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      id: null,
      email: null,
      name: null,
      picture: null,
      error
    }
  },
  /* Logout */
  [REMOVE_USER_DETAILS_SUCCESS]: function removeUserDetailsSuccessActionHandler() {
    return {
      fetchState: FETCH_STATES.FETCH_INIT,
      id: null,
      email: null,
      name: null,
      picture: null,
      error: null,
    }
  },
  [REMOVE_USER_DETAILS_FAILURE]: function removeUserDetailsFailureActionHandler({error}) {
    return {
      fetchState: FETCH_STATES.FETCH_FAILED,
      error
    }
  }
}

export default function userTokenReducer(state = initialState, {type, ...actionProps}) {
  if (type in actionHandlers) return actionHandlers[type](actionProps)
  return state
}

function requestUserDetails() {
  return {
    type: FETCH_USER_DETAILS
  }
}

function receiveUserDetailsSuccess({user_id: id, email, name, picture}) {
  return {
    type: FETCH_USER_DETAILS_SUCCESS,
    id,
    email,
    name,
    picture,
    error: null
  }
}

function receiveUserDetailsFailure({error}) {
  return {
    type: FETCH_USER_DETAILS_FAILURE,
    token: null,
    error
  }
}

function removeUserDetailsSuccess() {
  return {
    type: REMOVE_USER_DETAILS_SUCCESS
  }
}

export function fetchUserDetails(userDetails) {
  return function _fetchUserDetails(dispatch) {
    dispatch(requestUserDetails())
    try {
      dispatch(receiveUserDetailsSuccess(userDetails))
    } catch (err) {
      dispatch(receiveUserDetailsFailure(err))
    }
  }
}

export function removeUserDetails() {
  return function _removeUserDetails(dispatch) {
    return dispatch(removeUserDetailsSuccess())
  }
}
