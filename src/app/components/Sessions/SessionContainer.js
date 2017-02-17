import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import moment from 'moment'
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
    this.state = {
      futureSessions: [],
      pastSessions: []
    }
    this.refreshSessions = this.refreshSessions.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this._filterSessionsIntoUpcomingAndPast(nextProps.sessions) // eventually will move this into the redux sessions module but for now it's good here
  }

  _filterSessionsIntoUpcomingAndPast(sessions) {
    sessions.map(session => {
      const {datetime} = session
      if (moment().isBefore(datetime)) {
        this.setState({ futureSessions: this.state.futureSessions.concat([session]) })
      } else {
        this.setState({ pastSessions: this.state.pastSessions.concat([session]) })
      }
    })
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
    const {futureSessions} = this.state
    const {unbookSession, user} = this.props
    return (
      <div>
        <div styleName="session__container--header display--flex flex--center-between">
          <h3 styleName="session__container__header--name">Upcoming Sessions</h3>
          <a href="#" styleName="session__container--refresh-btn" onClick={this.refreshSessions}>Refresh</a>
        </div>
        <SessionList sessions={futureSessions} user={user} unbookSession={unbookSession} />
      </div>
    )
  }

  renderPastSessions() {
    const {pastSessions} = this.state
    const {unbookSession, user} = this.props
    return (
      <div>
        <div styleName="session__container--header">
          <h3 styleName="session__container__header--name">Past Sessions</h3>
        </div>
        <SessionList sessions={pastSessions} user={user} unbookSession={unbookSession} />
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
