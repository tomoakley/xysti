import React, {Component, PropTypes} from 'react'
import 'isomorphic-fetch'

export default class Signup extends Component {

  static propTypes = {
    config: PropTypes.object,
    fetchUserDetails: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.onSignupSubmit = this.onSignupSubmit.bind(this)
    this.email = null
    this.password = null
    this.confirmPassword = null
  }

  onSignupSubmit(event) {
    const {
      url: apiUrl
    } = this.props.config.api
    console.log('apiurl', apiUrl)
    event.preventDefault()
    if (this._password.value === this._confirmPassword) {
      fetch(`${apiUrl}/user/signup`, {
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
  }

  renderForm() {
    return (
      <form onSubmit={this.onSignupSubmit}>
        <div className="form__input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={el => { this._email = el }} />
        </div>
        <div className="form__input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={el => { this._password = el }} required />
        </div>
        <div className="form__input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" ref={el => { this._confirmPassword = el }} required />
        </div>
        <button type="submit">Signup</button>
      </form>
    )
  }

  render() {
    return this.renderForm()
  }

}
