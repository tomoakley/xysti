import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import LoginForm from 'app/components/LoginForm/LoginForm'
import {fetchUserDetails, removeUserDetails} from 'app/redux/modules/user'

export default connect(
  pick(['user', 'config']),
  {fetchUserDetails, removeUserDetails}
)(
  class Login extends Component {

    static propTypes = {
      user: PropTypes.object,
      config: PropTypes.object,
      fetchUserDetails: PropTypes.func,
      removeUserDetails: PropTypes.func
    }

    render() {
      const styles = require('./Login.scss');
      const {user, config} = this.props
      return (
        <div className={styles.loginPage + ' container'}>
          <Helmet title="Login"/>
          <h1>Login</h1>
          <LoginForm user={user} config={config} fetchUserDetails={this.props.fetchUserDetails} removeUserDetails={this.props.removeUserDetails} />
        </div>
      );
    }
  }
)
