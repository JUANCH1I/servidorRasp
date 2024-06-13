const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
let clients = []

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')))

// Manejo de todas las rutas no definidas para devolver el archivo HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use(cors())
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

server.listen(1234, () => {
  console.log('Servidor corriendo en el puerto 3000')
})
