import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import config from '../../config'
import {reauthenticate} from '../../utils/AuthService'
import {fetchUserDetails} from 'redux/modules/user'
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
      const {fetchState} = this.props.user
      if (fetchState === FETCH_STATES.INIT) reauthenticate().then(data => this.props.fetchUserDetails(data))
    }

    render() {
      const {
        user: {name, picture, auth}
      } = this.props
      const styles = require('./App.scss')

      return (
        <div className={styles.app}>
          <Helmet {...config.app.head}/>
          {auth ? <img src={picture} style={{width: '75px', display: 'inline-block', borderRadius: '100%'}} /> : null}
          <h1 style={{display: 'inline-block'}}>Hey {name}!</h1>

          <div className={styles.appContent}>
            {this.props.children}
          </div>

        </div>
      )
    }
  }
)
