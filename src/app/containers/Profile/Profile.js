import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {pick} from 'ramda'
import Helmet from 'react-helmet'
import ProfilePage from 'app/components/Profile/Profile'
import {removeUserDetails} from 'app/redux/modules/user'

export default connect(
  pick(['user', 'config']), {removeUserDetails}
)(
  class Profile extends Component {

    static propTypes = {
      user: PropTypes.object,
      config: PropTypes.object,
      removeUserDetails: PropTypes.func
    }

    render() {
      return (
        <div>
          <Helmet title="Profile"/>
          <h1>Profile</h1>
          <ProfilePage user={this.props.user} config={this.props.config} logout={this.props.removeUserDetails} />
        </div>
      )
    }
  }
)
