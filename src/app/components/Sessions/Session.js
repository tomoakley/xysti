import React, {Component, PropTypes} from 'react'

export default class Session extends Component {

  static propTypes = {
    details: PropTypes.object,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  renderDetails() {
    const {
      details: {title, location, datetime}
    } = this.props
    return (
      <div className="session__details">
        <h3 className="session__details--title">{title}</h3>
        <span className="session__details--datetime">{datetime}</span>
        <span className="session__details--location">{location}</span>
      </div>
    )
  }

  renderUnbookButton() {
    const {
      details: {
        id: sessionId
      },
      user: {
        id: userId
      },
      unbookSession
    } = this.props
    const onClick = (event) => {
      event.preventDefault()
      fetch(`/api/sessions/delete/${userId}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json'
        }
      }).then(response => response.json())
        .then(data => {
          console.log(data)
          if (data.rows === 1) {
            unbookSession(sessionId)
          }
        })
        .catch(err => console.log(err))
    }
    return <a href="#" onClick={onClick}>Unbook</a>
  }

  renderButton() {

  }

  render() {
    return (
      <li>
        {this.renderDetails()}
        {this.renderUnbookButton()}
      </li>
    )
  }

}
