import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import styles from './Home.scss'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import SessionContainer from 'app/components/Sessions/SessionContainer'
import {fetchSessions, unbookSession} from 'app/redux/modules/sessions'

@cssModules(styles, {allowMultiple: true})
export default connect(
  pick(['sessions', 'user']), {fetchSessions, unbookSession}
)(
  class Home extends Component {

    static propTypes = {
      user: PropTypes.object,
      sessions: PropTypes.object,
      fetchSessions: PropTypes.func,
      unbookSession: PropTypes.func
    }

    render() {
      const {
        user,
        sessions: {items}
      } = this.props
      return (
        <div>
          <Helmet title="Home"/>
          <h2 styleName="content__home--title">Xysti is an on-demand sports app, which you interact with through a chatbot</h2>
          <SessionContainer sessions={items || null} user={user} fetchSessions={this.props.fetchSessions} unbookSession={this.props.unbookSession} />
        </div>
      )
    }
  }
)
