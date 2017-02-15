import React, {Component, PropTypes} from 'react'
import moment from 'moment'
import SessionList from 'app/components/Sessions/SessionList'

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
    sessions.map((session, key) => {
      console.log(key)
      const {datetime} = session
      if (moment() > moment(datetime).format('DD/MM/YYYY')) {
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
        <h3>Upcoming Sessions</h3>
        <SessionList sessions={futureSessions} user={user} unbookSession={unbookSession} />
        <a href="#" onClick={this.refreshSessions}>Refresh</a>
      </div>
    )
  }

  renderPastSessions() {
    const {pastSessions} = this.state
    const {unbookSession, user} = this.props
    return (
      <div>
        <h3>Past Sessions</h3>
        <SessionList sessions={pastSessions} user={user} unbookSession={unbookSession} />
        <a href="#" onClick={this.refreshSessions}>Refresh</a>
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
