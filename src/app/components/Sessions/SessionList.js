import React, {Component, PropTypes} from 'react'
import Session from 'app/components/Sessions/Session'

export default class SessionList extends Component {

  static propTypes = {
    sessions: PropTypes.array,
    user: PropTypes.object,
    fetchSessions: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.refreshSessions = this.refreshSessions.bind(this)
  }

  refreshSessions(event) {
    const {
      user: {id}
    } = this.props
    event.preventDefault()
    this.props.fetchSessions(id)
  }

  render() {
    const {sessions} = this.props
    return (
      <div className="session__container">
        <ul className="session__list">
          {sessions ? sessions.map((session, key) => <Session details={session} key={key} />) : <span>No Sessions Found</span>}
        </ul>
        <a href="#" onClick={this.refreshSessions}>Refresh</a>
      </div>
    )
  }

}
