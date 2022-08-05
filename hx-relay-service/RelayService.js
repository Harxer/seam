// Relay WebRTC Server
let relayServer = require("./api/router.js");
const WEBSOCKET_PORT = 10001;
relayServer.listen(WEBSOCKET_PORT);

console.log(`${new Date()} - Relay server started. Port(${WEBSOCKET_PORT})`);

// Stun ICE Server
let stun = require('stun');
const { STUN_BINDING_REQUEST, STUN_ATTR_XOR_MAPPED_ADDRESS } = stun.constants;
const STUN_SERVER_PORT = 19302;
const stunServer = stun.createServer();
const request = stun.createMessage(STUN_BINDING_REQUEST);

stunServer.once('bindingResponse', _ => {
  // console.log('your ip:', stunMsg.getAttribute(STUN_ATTR_XOR_MAPPED_ADDRESS).value.address);
  stunServer.close()
});

console.log('Stun server started.');
