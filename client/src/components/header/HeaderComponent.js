import React from 'react';
import PropTypes from 'prop-types';
import './header.css';
import { CLIENT_VERSION } from '../Constants'

/**
 * @props guid {integer} - User's GUID
 */
class HeaderComponent extends React.Component {

  constructor(props) {
    super(props)

    // this.state = {
    //   user: '',
    //   pwd: '',
    //   loggingIn: false
    // }

    // this.handleUserInput = this.handleUserInput.bind(this);
  }

  // handleUserInput(event) {
  //   this.setState({user: event.target.value});
  // }

  render() {
    // const { user, pwd, loggingIn } = this.state
    const { guid, isConnected } = this.props
    let connectionIconClass = `connectionIcon ${isConnected ? 'connected' : ''}`
    let guidClass = `guidLabel ${isConnected ? 'connected' : ''}`

    let connectButtonText = isConnected ? "Disconnect" : "Connect"
    let offClass = isConnected ? "off" : ""

    return (
      <div id='header'>
        <h1 id='header-title'>SEAM</h1>
        <h2 id='header-version'>v{CLIENT_VERSION}</h2>
        <div id='header-guid-container'>
          <p className={`button connect ${offClass}`} onClick={this.props.handleRelayConnect}>{connectButtonText}</p>
          <div className={connectionIconClass}></div>
          <p className={guidClass}>{guid}</p>
        </div>
      </div>
    );
  }
}

HeaderComponent.defaultProps = {
  guid: undefined,
  isconnected: false
}

HeaderComponent.propTypes = {
  guid: PropTypes.number,
  isconnected: PropTypes.bool,
  handleRelayConnect: PropTypes.func
}

export default HeaderComponent;
