const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

let clients = []

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
  console.log('Nueva conexión: ', socket.id)
  clients.push(socket.id)

  // Reenviar video a todos los clientes
  socket.on('video', (data) => {
    socket.broadcast.emit('video', data)
  })

  // Reenviar audio a todos los clientes
  socket.on('audio', (data) => {
    socket.broadcast.emit('audio', data)
  })

  // Controlar pines GPIO
  socket.on('control', (command) => {
    io.emit('control', command)
  })

  socket.on('disconnect', () => {
    console.log('Desconexión: ', socket.id)
    clients = clients.filter((id) => id !== socket.id)
  })
})

server.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
