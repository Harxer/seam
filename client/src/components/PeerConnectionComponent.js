import React from 'react';
import PropTypes from 'prop-types';
import './peerConnection.css';
import * as Seam from '@harxer/seam-lib/Seam'

class PeerConnectionComponent extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      chatVisible: true
    }
  }

  componentDidMount() {
    if (this.latestChatMsg) {
      this.latestChatMsg.scrollIntoView({ behavior: "auto" })
    }
  }

  componentDidUpdate() {
    if (this.latestChatMsg) {
      this.latestChatMsg.scrollIntoView({ behavior: "smooth" })
    }
  }

  handleLinkClick(disconnect) {
    this.props.handleSeamConnect(disconnect)
  }

  // let fileShare = connected => {
  //   if (!connected) return

  //   return (
  //     <div className="button-styleIcon">
  //       <label class="file-upload-container">
  //         <input type="file" className="file-input" ref={elem => {
  //           if (elem)
  //             elem.addEventListener('change', e => elem.files.length && connection.fileOffer(elem.files[0]))
  //         }}/>
  //         <BsFolderPlus />
  //       </label>
  //     </div>
  //   )
  // }
  // let fileShareRequest = connected => {
  //   if (!connected) return
  //   let fileRequest = Seam.getFileRequest(selectedPeer)
  //   if (fileRequest === undefined) return
  //   let fileName =  (fileRequest.length > 1) ? fileRequest[1] : ""
  //   let fileSize =  (fileRequest.length > 2) ? fileRequest[2] : ""
  //   return <p id="btn-logout" className="button-style1" onClick={() => {
  //     connection.fileAccept(fileName, fileSize).then(_ => this.forceUpdate())
  //   }}><BsArrowBarDown />{`${fileName} (${fileSize})`}</p>
  // }

  /**
   * Connection content container for display
   * @param connection {Object} - Connection object
   * @returns {<div>}
   */
   contentContainerElement(connection) {
    if (connection === undefined) return <div id='noConnection'></div>

    let callEnabled = connection.acceptedChannels().has(Seam.CHANNEL_TYPE.Call)
    let chatData = connection.chatData()
    return (
      <div className='content'>
        {callEnabled && this.callContainerElement()}
        {this.state.chatVisible && this.chatContainerElement(chatData)}
      </div>
    )
  }

  /**
   * Call container for audio or video display
   * @returns {<div>}
   */
  callContainerElement() {
    {/* <video className="video-remote" ref={vid => {
      if (vid) vid.srcObject = this.state.videoStreamRemote
    }} autoPlay /> */}

    let mainVideo = (
      <video className="video-main" ref={vid => {
        if (vid) vid.srcObject = this.props.videoStreamRemote || this.props.videoStreamLocal
      }} autoPlay />
    )

    // this.props.videoStreamRemote
    let selfVideo = true && (
      <video className="video-self" ref={vid => {
        if (vid) vid.srcObject = this.props.videoStreamLocal
      }} autoPlay />
    )

    return (
      <div id='call-container'>
        {mainVideo}
        {selfVideo}
      </div>
    )
  }

  handleChatInputKeypress = e => {
    if(e.key === 'Enter'){
      this.handleChatSend()
      e.preventDefault()
    }
  }

  handleChatSend = e => {
    if (!this.props.connection || !this.props.connection.isChatOpen()) return

    if (this.chatInput.value.trim() === "") return
    this.props.connection.chatMessage(this.chatInput.value)
    this.chatInput.value = ""
    this.forceUpdate()
  }

  /**
   * Chat container for messages display
   * @param chatData {[Object]} - Array of message data
   * @returns {<div>}
   */
  chatContainerElement(chatData) {
    let disabledClass = this.props.connection.isChatOpen() ? 'enabled' : 'disabled'
    return (
      <div id='chat-container'>
        <ul className='message-list'>
          {chatData.map((data, i) => this.chatMessageElement(data, i))}
        </ul>
        <div className='chat-send-container'>
          <textarea disabled={!this.props.connection.isChatOpen()} className={disabledClass} onKeyPress={e => this.handleChatInputKeypress(e)} ref={e => this.chatInput = e}/>
          <p className={disabledClass} onClick={_ => this.handleChatSend()}>SEND</p>
        </div>
      </div>
    )
  }

  /**
   * Converts a chat message to a <li> for display in chat container
   * @param data {Object} - Chat message data
   * @returns {<li>}
   */
  chatMessageElement(data, i) {
    let className = data.source === "self" ? "client-message" : "peer-message"
    let source = data.source === "self" ? "Me: " : "Peer: "
    return (
      <li ref={e => this.latestChatMsg = e} key={i} className={className}><b>{source}</b>{data.message}</li>
    )
  }

  handleChatVisible() {
    this.setState({chatVisible: !this.state.chatVisible})
  }

  getLinkStatus() {
    const { connection, selectedPeer } = this.props
    if (connection && connection.stale()) {
      if (connection.isChatOpen()) return "STALE LINK"
      return "STALE"
    }
    if (!connection) return "UNLINKED"
    if (connection.isChatOpen()) return "LINKED"
    if (connection.acceptedChannels().has(Seam.CHANNEL_TYPE.Chat)) return "AWAITING PEER"
    if (Seam.hasRequest(selectedPeer)) return "PEER WAITING"
    return "UNLINKED"
  }

  render() {
    const { chatVisible } = this.state
    const { connection, selectedPeer } = this.props

    // No Peer Selected Element
    if (selectedPeer === undefined) return <div id='noSelectedPeer'></div>

    let isLinked = connection !== undefined && connection.isChatOpen()
    let isApproved = connection !== undefined && connection.acceptedChannels().has(Seam.CHANNEL_TYPE.Chat)
    let isStale = connection !== undefined && connection.stale()

    let linkLabelText = this.getLinkStatus()
    let isLinkedClass = isLinked ? 'enabled' : ''
    let linkButtonText = isApproved ? "UNLINK" : "LINK"
    let linkButtonClass = isApproved ? '' : 'enabled'
    let linkButtonOnClick = () => this.handleLinkClick(isApproved)

    // let connectionClass = (connection && connection.isChatOpen()) ? 'connected' : ''
    let chatButtonClass = chatVisible ? '' : 'disabled'

    let linkButton = (!isStale || (isStale && isLinked)) && <p className={`button link ${linkButtonClass}`} onClick={linkButtonOnClick}>{linkButtonText}</p>

    return (
      <div id='peerConnection'>
        <div className='header'>
          <div className='peerIcon'></div>
          <p className='guid'>{selectedPeer}</p>
          {isLinked && <div className={`icon chat ${chatButtonClass}`} onClick={() => this.handleChatVisible()}></div>}
          {isLinked && <div className='icon call' onClick={() => this.props.handleCallPressed(connection)}></div>}
          <div className='container-connection'>
            {linkButton}
            <div className={`link-icon ${isLinkedClass}`}></div>
            <p className={`link-label ${isLinkedClass}`}>{linkLabelText}</p>
          </div>
        </div>
        {this.contentContainerElement(connection)}
      </div>
    );
  }
}

PeerConnectionComponent.defaultProps = {
  connection: undefined,
  callEnabled: false,
  selectedPeer: undefined
}

PeerConnectionComponent.propTypes = {
  connection: PropTypes.object,
  callEnabled: PropTypes.bool,
  selectedPeer: PropTypes.number,
  handleSeamConnect: PropTypes.func,
  handleCallPressed: PropTypes.func,
  videoStreamRemote: PropTypes.object,
  videoStreamLocal: PropTypes.object
}

export default PeerConnectionComponent;
