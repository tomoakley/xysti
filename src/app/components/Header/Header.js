import React, {Component, PropTypes} from 'react'
import cssModules from 'react-css-modules'
import styles from './header.scss'
import {Link} from 'react-router'

@cssModules(styles, {allowMultiple: true})
export default class Header extends Component {

  static propTypes = {
    user: PropTypes.object
  }

  renderLogo() {
    return <Link to="/" styleName="headerLogo">Xysti</Link>
  }

  renderUser() {
    const {name, picture} = this.props.user
    return (
      <Link to="/profile" styleName="headerUser">
        <img src={picture} styleName="headerUser__picture" alt={`${name} picture`} />
        <strong>Hi, {name}</strong>
      </Link>
    )
  }

  renderLoginMessage() {
    return <Link to="/login">Login or sign up</Link>
  }

  render() {
    const {
      user: {id}
    } = this.props
    return (
      <header styleName="siteHeader">
        <div styleName="l--constrained display--flex flex--center-between">
          {this.renderLogo()}
          {id ? this.renderUser() : this.renderLoginMessage()}
        </div>
      </header>
    )
  }

}
