import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import Session from 'app/components/Sessions/Session'
import styles from './session.scss'

@cssModules(styles, {allowMultiple: true})
export default class SessionList extends Component {

  static propTypes = {
    sessions: PropTypes.array,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  render() {
    const {sessions, user} = this.props
    return (
      <ul styleName="session__list display--flex">
        {sessions ? sessions.map((session, key) => <Session details={session} unbookSession={this.props.unbookSession} user={user} key={key} />) : <li>No Sessions Found</li>}
      </ul>
    )
  }

}
