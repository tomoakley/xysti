import React, {Component, PropTypes} from 'react'
import 'isomorphic-fetch'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import config from '../../../config'
import Header from 'app/components/Header/Header'
import {fetchUserDetails} from 'app/redux/modules/user'
import {isLoggedIn} from 'utils/AuthService'
import FETCH_STATES from 'utils/redux/FETCH_STATES'

export default connect(
  pick(['user']), {fetchUserDetails}
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

    componentWillMount() {
      const {user} = this.props
      if (user.fetchState === FETCH_STATES.INIT) {
        isLoggedIn().then(data => {
          this.props.fetchUserDetails(data)
        })
      }
    } // this should all go into a redux-async-connect method (@asyncConnect)

    render() {
      const {user} = this.props
      const styles = require('./App.scss')
      return (
        <div className={styles.app}>
          <Helmet {...config.app.head}/>
          <Header user={user} />
          <div className={styles.appContent}>
            {this.props.children}
          </div>
        </div>
      )
    }
  }
)
