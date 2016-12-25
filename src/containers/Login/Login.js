import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import LoginForm from 'components/LoginForm/LoginForm'
import {fetchUserDetails, removeUserDetails} from 'redux/modules/user'

export default connect(
  pick(['user']),
  {fetchUserDetails, removeUserDetails}
)(
  class Login extends Component {

    static propTypes = {
      user: PropTypes.object,
      fetchUserDetails: PropTypes.func,
      removeUserDetails: PropTypes.func
    }

    render() {
      const styles = require('./Login.scss');
      const {user} = this.props
      return (
        <div className={styles.loginPage + ' container'}>
          <Helmet title="Login"/>
          <h1>Login</h1>
          <LoginForm user={user} fetchUserDetails={this.props.fetchUserDetails} removeUserDetails={this.props.removeUserDetails} />
        </div>
      );
    }
  }
)
