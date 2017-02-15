import React, {Component, PropTypes} from 'react'
import Session from 'app/components/Sessions/Session'

export default class SessionList extends Component {

  static propTypes = {
    sessions: PropTypes.array,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  render() {
    const {sessions, user} = this.props
    return (
      <ul className="session__list">
        {sessions ? sessions.map((session, key) => <Session details={session} unbookSession={this.props.unbookSession} user={user} key={key} />) : <li>No Sessions Found</li>}
      </ul>
    )
  }

}
