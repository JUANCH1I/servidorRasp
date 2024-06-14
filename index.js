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

let broadcasters = {}

io.on('connection', (socket) => {
  console.log('Nueva conexión: ', socket.id)

  socket.on('offer', async (offer) => {
    const peerConnection = new wrtc.RTCPeerConnection()
    const id = socket.id
    broadcasters[id] = peerConnection

    peerConnection.onicecandidate = ({ candidate }) => {
      socket.emit('ice-candidate', { candidate, id })
    }

    peerConnection.ontrack = (event) => {
      broadcasters[id].stream = event.streams[0]
      io.emit('new-broadcaster', id) // Notificar a los clientes de un nuevo broadcaster
    }

    await peerConnection.setRemoteDescription(
      new wrtc.RTCSessionDescription(offer)
    )
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    socket.emit('answer', { answer, id })
  })

  socket.on('ice-candidate', async ({ candidate, id }) => {
    if (candidate && broadcasters[id]) {
      try {
        await broadcasters[id].addIceCandidate(
          new wrtc.RTCIceCandidate(candidate)
        )
      } catch (error) {
        console.error('Error adding received ice candidate', error)
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('Desconexión: ', socket.id)
    if (broadcasters[socket.id]) {
      broadcasters[socket.id].close()
      delete broadcasters[socket.id]
      io.emit('broadcaster-disconnected', socket.id)
    }
  })
})

server.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
