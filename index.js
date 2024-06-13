const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const wrtc = require('wrtc')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

let senderStream = null

io.on('connection', (socket) => {
  console.log('Nueva conexión: ', socket.id)

  socket.on('offer', async (offer) => {
    const peerConnection = new wrtc.RTCPeerConnection()
    peerConnection.onicecandidate = ({ candidate }) => {
      socket.emit('ice-candidate', candidate)
    }

    if (senderStream) {
      senderStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, senderStream)
      })
    }

    await peerConnection.setRemoteDescription(
      new wrtc.RTCSessionDescription(offer)
    )
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    socket.emit('answer', answer)
  })

  socket.on('ice-candidate', async (candidate) => {
    try {
      await peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding received ice candidate', error)
    }
  })

  socket.on('broadcaster', () => {
    console.log('Nueva transmisión de video')
    senderStream = peerConnection
      .getReceivers()
      .map((receiver) => receiver.track)
  })

  socket.on('disconnect', () => {
    console.log('Desconexión: ', socket.id)
    if (senderStream) {
      senderStream.getTracks().forEach((track) => track.stop())
    }
  })
})

server.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
