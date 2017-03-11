import React, {Component, PropTypes} from 'react'
import 'isomorphic-fetch'
import {Link} from 'react-router'
import {logout} from 'utils/AuthService'

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
    fetch('https://api.xysti.co/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this._email.value,
        password: this._password.value
      }),
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => this.props.fetchUserDetails(data))
    .catch(err => console.log(`ERROR: ${err}`))
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
    return user.id ? this.renderLoggedInMessage() : this.renderForm()
  }

}
