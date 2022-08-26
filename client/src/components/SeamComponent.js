import React from 'react';
import './seam.css';
import * as RelayClient from '@harxer/seam-lib/RelayClient'
import * as Seam from '@harxer/seam-lib/Seam'
import { STATUS as CONNECTION_STATUS } from '@harxer/seam-lib/Seam'
import { BsFillShieldLockFill, BsArrowUpRight, BsArrowDownLeft,
  BsFillTelephonePlusFill, BsFillTelephoneXFill, BsFolderPlus, BsForwardFill, BsForward,
  BsArrowBarUp, BsArrowBarDown, BsChevronDoubleDown } from "react-icons/bs";

import { AUTH_DOMAIN } from '@harxer/seam-lib';
import { validateSession, invalidateSession } from '@harxer/session-manager-lib';
import Login from './Login';

import HeaderComponent from './header/HeaderComponent'
import PeerListComponent from './PeerListComponent'
import PeerConnectionComponent from './PeerConnectionComponent'

class SeamComponent extends React.Component {
  constructor(props) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this);

    this.state = {
      loggedIn: false,
      guid: undefined,
      selectedPeer: undefined,
      peers: [/** {guid:number, isStale: bool} */],
      videoStreamLocal: undefined,
      videoStreamRemote: undefined,
      notifications: []
    }

    this.handlePeerSelected = this.handlePeerSelected.bind(this);
    this.handleCallPressed = this.handleCallPressed.bind(this);
    this.handleSeamConnect = this.handleSeamConnect.bind(this);
    this.handleRelayConnect = this.handleRelayConnect.bind(this);
  }

  componentDidMount() {
    validateSession(AUTH_DOMAIN).then(_ => this.handleLogin()).catch(_ => {})
  }

  handleLogin() {
    this.setState({loggedIn: true})
  }

  addNotificationFrom(guid) {
    if (this.state.notifications.includes(guid) || this.state.selectedPeer === guid) return
    this.setState({notifications: this.state.notifications.concat([guid])})
  }

  setupRelayClient() {
    RelayClient.setNotifyAvailable(_ => {
      this.generatePeerList()
    }) // Relay peer joined
    RelayClient.setNotifyExit(data => {
      Seam.handleExit(data)
      this.generatePeerList()
    }) // Relay peer exited
    RelayClient.setNotifyClose(() => {
      this.generatePeerList()
    }) // Relay client connection lost
  }

  setupSeam() {
    RelayClient.setHandleRelay(Seam.handleRelay) // Required attach relay to seam
    Seam.setNotifyRequest(guid => {
      this.addNotificationFrom(guid)
      this.forceUpdate()
    }) // New Offer
    Seam.setNotifyClosed(() => this.generatePeerList()) // Closed RTC
  }

  handleRelayConnect() {
    if (RelayClient.isConnected()) {
      return RelayClient.disconnect()
    }
    this.setupRelayClient()
    this.setupSeam()
    RelayClient.connect((guid, _) => {
      this.generatePeerList()
      this.setState({guid: guid})
    })
  }

  async handleSeamConnect(disconnect = false) {
    let guid = this.state.selectedPeer
    if (guid === undefined) return
    if (disconnect) {
      return Seam.getPeer(guid).reject()
    }
    let seamConnection = await Seam.connect(guid, status => {
      if (status === CONNECTION_STATUS.Requested) {
      } else if (status === CONNECTION_STATUS.Accepted) {
        if (this.videoStreamRemote && !seamConnection.isCallOpen()) {
          this.setState({videoStreamRemote: undefined})
        }
      } else if (status === CONNECTION_STATUS.ChatOpen) {
      } else if (status === CONNECTION_STATUS.ChatClosed) {
      } else if (status === CONNECTION_STATUS.FileOpen) {
      }

      this.addNotificationFrom(guid)
      this.forceUpdate()
    })
    seamConnection.setChatNotifyMessage(m => {
      this.addNotificationFrom(guid)
      this.forceUpdate()
    })
    this.generatePeerList()
  }

  /**
   * Updates selectedPeer and list of interactable peers based on conditions:
   * - If RelayServer is connected, all relay peers.
   * - All stable connected seam peers that don't collide with added relay peers.
   */
  generatePeerList() {
    let peers = new Set()
    // Relay peers
    if (RelayClient.isConnected()) {
      RelayClient.getPeers().forEach(peer => peers.add(peer))
    }
    // stable chat connections and saved data connections
    Seam.getOpenPeers().forEach(peer => peers.add(peer.guid()))
    // Verify selectedPeer is still in list - else clear it
    let selectedPeer = peers.has(this.state.selectedPeer) ? this.state.selectedPeer : undefined

    console.log(`Get peer list:`)
    this.setState({selectedPeer, peers: Array.from(peers).map(peer => {
      let connection = Seam.getPeer(peer)
      let guid = connection ? connection.guid() : peer
      let isStale = connection ? connection.stale() : false
      console.log(`  Peer ${guid} - stale: ${isStale}`)
      return {guid, isStale}
    })})
  }

  handleCallPressed(connection) {
    if (connection.acceptedChannels().has(Seam.CHANNEL_TYPE.Call)) {
      this.setState({videoStreamLocal: undefined, videoStreamRemote: undefined})
      return connection.callEnd()
    }

    // Local Cam
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then(stream => {
      this.setState({videoStreamLocal: stream})
    })

    // Remote Cam
    connection.callStart(stream => {
      this.setState({videoStreamRemote: stream})
    })
  }

  handlePeerSelected(peer) {
    let newState = {}
    let selectedPeer = this.state.selectedPeer === peer ? undefined : peer
    newState.selectedPeer = selectedPeer
    if (selectedPeer) {
      newState.notifications = this.state.notifications.filter(value => value != selectedPeer)
    }
    this.setState(newState)
  }

  render() {
    const { loggedIn, guid, peers, selectedPeer, notifications, videoStreamLocal, videoStreamRemote } = this.state;

    if (!loggedIn) return <Login handleLogin={this.handleLogin}/>

    const connection = Seam.getPeer(selectedPeer)
    let relayConnected = RelayClient.isConnected()

    return (
      <div id="seam">
        <HeaderComponent guid={guid} isConnected={relayConnected} handleRelayConnect={this.handleRelayConnect}/>
        <div className='content-container'>
          <PeerListComponent
            peers={peers}
            selectedPeer={selectedPeer}
            handlePeerSelected={this.handlePeerSelected}
            notifications={notifications}
          />
          <PeerConnectionComponent
            selectedPeer={selectedPeer}
            connection={connection}
            handleSeamConnect={this.handleSeamConnect}
            handleCallPressed={this.handleCallPressed}
            videoStreamLocal={videoStreamLocal}
            videoStreamRemote={videoStreamRemote}
          />
        </div>
      </div>
    )
  }
}

export default SeamComponent
