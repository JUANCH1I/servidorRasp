const socket = io('/')
var myPeer = new Peer()

const video = document.getElementById('video')

myPeer.on('open', (id) => {
  console.log('Conectado con ID de PeerJS:', id)
})

myPeer.on('call', (call) => {
  call.answer()
  call.on('stream', (stream) => {
    video.srcObject = stream
  })
})

function controlGPIO(command) {
  const instruction = JSON.stringify({ type: 'control', command })
  ws.send(instruction)
}
