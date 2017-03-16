import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import Rating from 'react-rating'
import Svg from 'app/components/icons/Svg'
import {formatDatetime, isSessionUpcoming} from 'utils/datetime'
import styles from './session.scss'

@cssModules(styles, {allowMultiple: true})
export default class Session extends Component {

  static propTypes = {
    details: PropTypes.object,
    user: PropTypes.object,
    unbookSession: PropTypes.func
  }

  constructor(props) {
    super(props)
    console.log('session details', props.details)
    this.state = {
      ratingBtnHover: false,
      sessionRating: this.props.details.rating
    }
    this.showRatingStars = this.showRatingStars.bind(this)
    this.hideRatingStars = this.hideRatingStars.bind(this)
  }

  showRatingStars() {
    this.setState({ ratingBtnHover: true })
  }

  hideRatingStars() {
    this.setState({ ratingBtnHover: false })
  }

  renderDetails() {
    const {
      details: {title, address, datetime}
    } = this.props
    const formattedDate = formatDatetime(datetime)
    return (
      <div styleName="session__details">
        <h3 styleName="session__details--title">{title}</h3>
        <span styleName="display--block">{formattedDate}</span>
        <span styleName="display--block">{address}</span>
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

  renderImage() {
    return <div styleName="session__image"></div>
  }

  renderRating() {
    const {ratingBtnHover, sessionRating} = this.state
    const {
      details: {
        id: sessionId
      },
      user: {
        id: userId
      }
    } = this.props
    const onChange = async (rating) => {
      const ratingResponse = await fetch(`/api/session/rate/${sessionId}/${userId}/${rating}`, { // TODO this should be a redux action e.g rateSession()
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
      const ratingJson = await ratingResponse.json()
      if (ratingJson['0'] === 1) this.setState({ sessionRating: rating })
    }
    const starEmpty = <Svg type="Star" height="24" fill="#fff" />
    const starFull = <Svg type="Star" height="24" fill="#444" />
    const starRating = <Rating styleName="session__rating--stars-container" onChange={onChange} initialRate={sessionRating} readonly={sessionRating > 0} quiet={sessionRating > 0} empty={starEmpty} placeholder={starFull} full={starFull} />
    const ratingButton = <a href="#" styleName="session__button">Rate Session</a>
    return (
      <div styleName="session__rating--container" onMouseEnter={this.showRatingStars} onMouseLeave={this.hideRatingStars}>
        { (ratingBtnHover || !!(sessionRating > 0)) ? starRating : ratingButton }
      </div>
    )
  }

  render() {
    const {datetime} = this.props.details
    return (
      <li styleName="session__list--session">
        {this.renderImage()}
        {this.renderDetails()}
        { isSessionUpcoming(datetime) ? this.renderUnbookButton() : this.renderRating() }
      </li>
    )
  }

}
