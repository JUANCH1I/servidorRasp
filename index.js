// servidor/index.js
const express = require('express')
const http = require('http')
const path = require('path')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

// Middleware para servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/build')))

io.on('connection', (socket) => {
  console.log('Nueva Raspberry conectada')

  socket.on('video', (data) => {
    // Transmitir el video a todos los clientes conectados
    socket.broadcast.emit('video', data)
  })

  socket.on('control', (command) => {
    // Manejar comandos para los pines GPIO
  })

  socket.on('disconnect', () => {
    console.log('Raspberry desconectada')
  })
})

// Ruta para servir la aplicación frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
})

server.listen(1234, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
