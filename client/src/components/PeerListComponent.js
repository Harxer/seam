import React from 'react';
import './peerList.css';
import PropTypes from 'prop-types';

class PeerListComponent extends React.Component {

  constructor(props) {
    super(props)
  }

  /**
   * Creates peer list element for display.
   * @param {[{guid: integer, isStale: bool}]} peers - List of peer conection as integers
   * @param {integer} selectedPeer - Selected peer GUID or undefined
   * @returns {<ul>}
   */
  peerListElement(peers, selectedPeer = undefined) {
    let peerItems = peers.map(peer => this.peerItemElement(peer, selectedPeer === peer.guid))
    return (
      <ul className='list'>
        {peerItems}
      </ul>
    )
  }

  /**
   * Convert peer ID number to HTML <li> item for display.
   * @param {{guid: integer, isStale: bool}} peer - id
   * @param {bool} isSelected - apply selection styling
   * @returns {<li>}
   */
  peerItemElement(peer, isSelected) {
    let notificationClass = this.props.notifications.includes(peer.guid) ? 'enabled' : ''
    let peerIconClass = `peerIcon ${isSelected ? 'selected' : ''}`
    let listItemClass = `${isSelected ? 'selected' : ''}  ${peer.isStale ? 'stale' : ''}`
    if (peer.isStale) console.log(`STALE ${peer.guid}`)
    return (
      <li key={peer.guid} className={listItemClass} onClick={() => this.props.handlePeerSelected(peer.guid)}>
        <div className={peerIconClass}>
          <div className={`notification ${notificationClass}`}></div>
        </div>
        <p>{peer.guid}</p>
    </li>
    )
  }

  render() {
    const { peers, selectedPeer } = this.props

    let noPeersElement = <p className='no-peers-label'>No peers available</p>

    return (
      <div id='peerList'>
        <p className='title'>Peers</p>
        {peers.length ? this.peerListElement(peers, selectedPeer) : noPeersElement}
        <div className='divider-bottom'></div>
      </div>
    );
  }
}

PeerListComponent.defaultProps = {
  peers: [],
  selectedPeer: undefined,
  handlePeerSelected: () => {},
  notifications: []
}

PeerListComponent.propTypes = {
  peers: PropTypes.arrayOf(PropTypes.PropTypes.shape({
    guid: PropTypes.number,
    isStale: PropTypes.bool
  })),
  selectedPeer: PropTypes.number,
  handlePeerSelected: PropTypes.func,
  notifications: PropTypes.arrayOf(PropTypes.number)
}

export default PeerListComponent;
