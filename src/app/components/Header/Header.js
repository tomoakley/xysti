import React, {Component, PropTypes} from 'react'
import styles from './header.scss'
import {Link} from 'react-router'

export default class Header extends Component {

  static propTypes = {
    user: PropTypes.object
  }

  renderLogo() {
    return <Link to="/" className={styles.headerLogo}>Xysti</Link>
  }

  renderUser() {
    const {name, picture} = this.props.user
    return (
      <Link to="/profile" className={styles.headerUser}>
        <img src={picture} className={styles.headerUser__picture} alt={`${name} picture`} />
        <span className={`${styles.headerUser__name} strong`}>Hi, {name}</span>
      </Link>
    )
  }

  renderLoginMessage() {
    return <Link to="/login" className={styles.headerLogin}>Login or sign up</Link>
  }

  render() {
    const {
      user: {id}
    } = this.props
    return (
      <header className={styles.siteHeader}>
        {this.renderLogo()}
        {id ? this.renderUser() : this.renderLoginMessage()}
      </header>
    )
  }

}
