import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import moment from 'moment'
import {pipe, path, complement} from 'ramda'
import SessionList from 'app/components/Sessions/SessionList'
import styles from './session.scss'

@cssModules(styles, {allowMultiple: true, errorWhenNotFound: false})
export default class SessionContainer extends Component {

  static propTypes = {
    sessions: PropTypes.array,
    user: PropTypes.object,
    fetchSessions: PropTypes.func,
    unbookSession: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.refreshSessions = this.refreshSessions.bind(this)
  }

  _getPastSessions(sessions) {
    return sessions.filter(pipe(path(['datetime']), complement(this._isSessionUpcoming)))
  }

  _getUpcomingSessions(sessions) {
    return sessions.filter(pipe(path(['datetime']), this._isSessionUpcoming))
  }

  _isSessionUpcoming(datetime) {
    return moment().isBefore(datetime) // return TRUE - upcoming; FALSE - past
  }


  refreshSessions(event) {
    const {
      user: {id},
      fetchSessions
    } = this.props
    event.preventDefault()
    fetchSessions(id)
  }

  renderUpcomingSessions() {
    const {unbookSession, user, sessions} = this.props
    const upcomingSessions = sessions && sessions.length > 0 ? this._getUpcomingSessions(sessions) : null
    return (
      <div>
        <div styleName="session__container--header display--flex flex--center-between">
          <h3 styleName="session__container__header--name">Upcoming Sessions</h3>
          <a href="#" styleName="session__container--refresh-btn" onClick={this.refreshSessions}>Refresh</a>
        </div>
        {upcomingSessions && upcomingSessions.length > 0 ? <SessionList sessions={upcomingSessions} user={user} unbookSession={unbookSession} /> : <span>No Results Found</span>}
      </div>
    )
  }

  renderPastSessions() {
    const {unbookSession, user, sessions} = this.props
    const pastSessions = sessions && sessions.length > 0 ? this._getPastSessions(sessions) : null
    return (
      <div>
        <div styleName="session__container--header">
          <h3 styleName="session__container__header--name">Past Sessions</h3>
        </div>
        {pastSessions && pastSessions.length > 0 ? <SessionList sessions={pastSessions} user={user} unbookSession={unbookSession} /> : <span>No Results Found</span>}
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderPastSessions()}
        {this.renderUpcomingSessions()}
      </div>
    )
  }

}
