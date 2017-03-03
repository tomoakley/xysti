import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import 'isomorphic-fetch'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import config from '../../../config'
import Header from 'app/components/Header/Header'
import {receiveUserDetailsSuccess} from 'app/redux/modules/user'
import {receiveSessionsSuccess} from 'app/redux/modules/sessions'
import {fetchSessionList} from 'utils/sessions'
import {reauthenticate} from 'utils/AuthService'
import {asyncConnect} from 'redux-async-connect'
import styles from './App.scss'

@asyncConnect([{
  promise: ({ store: { dispatch, getState } }) => {
    reauthenticate(getState().user).then(data => {
      Promise.resolve(dispatch(receiveUserDetailsSuccess(data))) // TODO make this use fetchUserDetails instead of the insider function
    }).then(() => {
      const {
        user: {id}
      } = getState()
      console.log('user id', id)
      if (id) {
        fetchSessionList(id).then(sessionList => Promise.resolve(dispatch(receiveSessionsSuccess(sessionList)))) // TODO same as above, use fetchSessions instead
      }
    })
  }
}])

@cssModules(styles, {allowMultiple: true})
export default connect(
  pick(['user']), {}
)(
  class App extends Component {
    static propTypes = {
      children: PropTypes.object.isRequired,
      user: PropTypes.object,
      fetchUserDetails: PropTypes.func
    }

    static contextTypes = {
      store: PropTypes.object.isRequired
    }

    render() {
      const {user} = this.props
      return (
        <div>
          <Helmet {...config.app.head}/>
          <Header user={user} />
          <div styleName="l--content">
            {this.props.children}
          </div>
        </div>
      )
    }
  }
)
