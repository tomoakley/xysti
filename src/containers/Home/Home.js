import React, { Component } from 'react';
import Helmet from 'react-helmet'

export default class Home extends Component {
  render() {
    const styles = require('./Home.scss');
    return (
      <div className={styles.home}>
        <Helmet title="Home"/>
        <h2 style={{display: 'inline-block'}}>Xysti is an on-demand sports app, which you interact with through a chatbot</h2>
      </div>
    )
  }
}
