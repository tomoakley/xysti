import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import SessionList from 'app/components/Sessions/SessionList'
import {fetchSessions} from 'app/redux/modules/sessions'

@connect(
  pick(['sessions', 'user']), {fetchSessions}
)
export default class Home extends Component {

  static propTypes = {
    user: PropTypes.object,
    sessions: PropTypes.object,
    fetchSessions: PropTypes.func
  }

  render() {
    const styles = require('./Home.scss')
    const {
      user,
      sessions: {items}
    } = this.props
    return (
      <div className={styles.home}>
        <Helmet title="Home"/>
        <h2 style={{display: 'inline-block'}}>Xysti is an on-demand sports app, which you interact with through a chatbot</h2>
        <SessionList sessions={items} user={user} fetchSessions={this.props.fetchSessions} />
      </div>
    )
  }
}
