const { PeerServer } = require('peer')

const peerServer = PeerServer({
    port: 5001,
    path: '/peer',
    corsOptions: {
        origin: "*"
    }
})

console.log('Peer server is running on port 5001')