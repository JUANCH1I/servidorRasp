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

  socket.on('offer', async ({ offer, id }) => {
    const peerConnection = new wrtc.RTCPeerConnection()
    broadcasters[id] = peerConnection

    peerConnection.onicecandidate = ({ candidate }) => {
      socket.emit('ice-candidate', candidate)
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
        await broadcasters[id].addIceCandidate(candidate)
      } catch (error) {
        console.error('Error adding received ice candidate', error)
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('Desconexión: ', socket.id)
    Object.keys(broadcasters).forEach((id) => {
      if (broadcasters[id].socket === socket) {
        delete broadcasters[id]
        io.emit('broadcaster-disconnected', id)
      }
    })
  })
})

server.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
