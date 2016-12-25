import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import ProfilePage from 'components/Profile/Profile'
import {removeUserDetails} from 'redux/modules/user'

export default connect(
  pick(['user']), {removeUserDetails}
)(
  class Profile extends Component {

    static propTypes = {
      user: PropTypes.object,
      removeUserDetails: PropTypes.func
    }

    render() {
      return (
        <div>
          <Helmet title="Profile"/>
          <h1>Profile</h1>
          <ProfilePage user={this.props.user} logout={this.props.removeUserDetails} />
        </div>
      )
    }
  }
)
