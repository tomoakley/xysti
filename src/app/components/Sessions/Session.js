import React, {Component, PropTypes} from 'react'

export default class Session extends Component {

  static propTypes = {
    details: PropTypes.object
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

  renderButton() {

  }

  render() {
    return <li>{this.renderDetails()}</li>
  }

}
