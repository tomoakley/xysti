import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import moment from 'moment'
import styles from './session.scss'

@cssModules(styles, {allowMultiple: true})
export default class Session extends Component {

  static propTypes = {
    details: PropTypes.object,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  _formatDatetime(datetime) {
    return moment(datetime).format('dddd D MMM HH:mm')
  }

  _isSessionUpcoming(datetime) {
    return moment().isBefore(datetime)
  }

  renderImage() {
    return <div styleName="session__image"></div>
  }

  renderDetails() {
    const {
      details: {title, location, datetime}
    } = this.props
    const formattedDate = this._formatDatetime(datetime)
    return (
      <div styleName="session__details">
        <h3 styleName="session__details--title">{title}</h3>
        <span styleName="display--block">{formattedDate}</span>
        <span styleName="display--block">{location}</span>
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
    return <a href="#" styleName="session__button" onClick={onClick}>Unbook</a>
  }

  renderButton() {

  }

  render() {
    const {datetime} = this.props.details
    return (
      <li styleName="session__list--session">
        {this.renderImage()}
        {this.renderDetails()}
        { this._isSessionUpcoming(datetime) ? this.renderUnbookButton() : null}
      </li>
    )
  }

}
