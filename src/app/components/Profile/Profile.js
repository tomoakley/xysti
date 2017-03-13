import React, {Component, PropTypes} from 'react'

export default class ProfilePage extends Component {

  static propTypes = {
    user: PropTypes.object,
    config: PropTypes.object,
    logout: PropTypes.func
  }

  render() {
    const {user} = this.props
    const {
      url: apiUrl
    } = this.props.config.api
    return (
      <p>
        Hi, {user.email}.
        <button onClick={this.props.logout}>Logout?</button>
        <a href={`${apiUrl}/api/user/link/facebook`}>Connect to facebook</a>
      </p>
    )
  }

}
