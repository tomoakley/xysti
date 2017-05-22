import React, {Component, PropTypes} from 'react'

export default class ProfilePage extends Component {

  static propTypes = {
    user: PropTypes.object,
    config: PropTypes.object,
    logout: PropTypes.func
  }

  render() {
    const {
      user: { name, facebook_id }
    } = this.props
    const { url: apiUrl } = this.props.config.api
    return (
      <div className="page--content">
        <h1>Hi, {name ? name[0] : null}!</h1>
        { !facebook_id ?
          <p>
            To use Xysti, you need to connect your account to Facebook:
            <a className="btn--xysti" href={`${apiUrl}/user/link/facebook`}>Connect to facebook</a>
          </p>
        : null }
        <button onClick={this.props.logout}>Logout?</button>
      </div>
    )
  }

}
