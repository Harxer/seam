/** ICE configuration. Alternative: 'stun:stun.sipgate.net:3478' */
export function initRtc(connection, stunUrl) {
  let rtc = new RTCPeerConnection({iceServers: [{urls: stunUrl}]})

  rtc.onicecandidate = (event) => {
    if (rtc.signalingState != "stable" || !event.candidate) return
    // TODO: Check if label and id need to be read from sending client
    connection.send({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate
    })
  }
  rtc.oniceconnectionstatechange = _ => {
    switch(rtc.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        connection.handleClosed()
        break
    }
  }
  rtc.onicegatheringstatechange = _ => {}
  rtc.onsignalingstatechange = () => {
      switch(rtc.signalingState) {
          case "closed":
            connection.handleClosed()
            break
        }
  }
  rtc.onnegotiationneeded = async () => {
      connection.sendOffer()
  }

  rtc.addEventListener('datachannel', evt => connection.chat.onDataChannel(evt.channel))
  rtc.addEventListener('datachannel', evt => connection.file.onDataChannel(evt.channel))

  return rtc
}

/** Set equality checker */
export function eqSet(as, bs) {
  if (as === undefined || bs === undefined || as.size !== bs.size) return false
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}
