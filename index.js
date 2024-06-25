const http = require('http')
const express = require('express')
const socketIo = require('socket.io')
const Peer = require('simple-peer')
const wrtc = require('wrtc')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado')

  socket.on('start-stream', () => {
    const peer = new Peer({ initiator: false, wrtc })

    peer.on('signal', (data) => {
      socket.emit('signal', data)
    })

    socket.on('signal', (data) => {
      peer.signal(data)
    })

    peer.on('data', (data) => {
      socket.emit('video-data', data)
    })
  })

  socket.on('control', (msg) => {
    // Reenviar control de GPIO a la Raspberry Pi
    const { device, state } = msg
    socket.broadcast.emit('control', { device, state })
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})

server.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000')
})
