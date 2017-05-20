import React, {Component, PropTypes} from 'react'
import 'isomorphic-fetch'

export default class Login extends Component {

  static propTypes = {
    config: PropTypes.object,
    fetchUserDetails: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.onLoginSubmit = this.onLoginSubmit.bind(this)
    this.email = null
    this.password = null
  }

  onLoginSubmit(event) {
    const {
      url: apiUrl
    } = this.props.config.api
    event.preventDefault()
    fetch(`${apiUrl}/login`, {
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

  renderForm() {
    return (
      <form onSubmit={this.onLoginSubmit}>
        <div className="form__input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={el => { this._email = el }} />
        </div>
        <div className="form__input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={el => { this._password = el }} required />
        </div>
        <button type="submit">Login</button>
      </form>
    )
  }

  render() {
    return this.renderForm()
  }

}
