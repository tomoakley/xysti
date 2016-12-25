import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import {login, logout} from 'utils/AuthService'

export default class Login extends Component {

  static propTypes = {
    user: PropTypes.object,
    fetchUserDetails: PropTypes.func,
    removeUserDetails: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.onLogoutClick = this.onLogoutClick.bind(this)
    this.email = null
    this.password = null
  }

  onLoginSubmit(event) {
    event.preventDefault()
    login({
      email: this._email.value,
      password: this._password.value
    }).then(json => {
      this.props.fetchUserDetails(json)
    })
  }

  onLogoutClick(event) {
    event.preventDefault()
    logout()
    this.props.removeUserDetails()
  }

  renderForm() {
    return (
      <form onSubmit={this.onLoginSubmit}>
        <input type="email" ref={el => { this._email = el }} />
        <input type="password" ref={el => { this._password = el }} required />
        <button type="submit">Login</button>
      </form>
    )
  }

  renderLoggedInMessage() {
    return <p>You're already logged in! You can <a href="#" onClick={this.onLogoutClick}>logout</a> if you want. Or <Link to="/profile">go to your profile</Link>.</p>
  }

  render() {
    const {user} = this.props
    return user.auth ? this.renderLoggedInMessage() : this.renderForm()
  }

}
