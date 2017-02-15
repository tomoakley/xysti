import React, {Component, PropTypes} from 'react'
import moment from 'moment'

export default class Session extends Component {

  static propTypes = {
    details: PropTypes.object,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  _formatDatetime(datetime) {
    return moment(datetime).format('dddd D MMM HH:mm')
  }

  renderDetails() {
    const {
      details: {title, location, datetime}
    } = this.props
    const formattedDate = this._formatDatetime(datetime)
    return (
      <div className="session__details">
        <h3 className="session__details--title display-color-red">{title}</h3>
        <span className="session__details--datetime">{formattedDate}</span>
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
        .then(data => (data.rows === 1) ? unbookSession(sessionId) : console.error(`Rows affected: ${data.rows}, should be 1`))
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
