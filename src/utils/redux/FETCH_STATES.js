const FETCH_STATES = {
  INIT: 'xysti/FETCH_STATES/INIT',
  IS_FETCHING: 'xysti/FETCH_STATES/IS_FETCHING',
  FETCH_SUCCESSFUL: 'xysti/FETCH_STATES/FETCH_SUCCESSFUL',
  FETCH_FAILED: 'xysti/FETCH_STATES/FETCH_FAILED',
  // When some data has been successfully fetched but more is coming
  FETCH_SUCCESSFUL_AND_FETCHING: 'xysti/FETCH_STATES/FETCH_SUCCESSFUL_AND_FETCHING',
  PARTIAL_FETCH_SUCCESSFUL_AND_AWAITING: 'xysti/FETCH_STATES/PARTIAL_FETCH_SUCCESSFUL_AND_AWAITING'
}

export default FETCH_STATES
