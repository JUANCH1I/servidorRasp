const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const { Server } = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const wss = new WebSocket.Server({ noServer: true })

app.use(express.static(__dirname))
app.use(express.json())

let gpioClients = []
let rtcConnections = []

io.on('connection', (socket) => {
  console.log('Client connected')
  gpioClients.push(socket)

  socket.on('disconnect', () => {
    console.log('Client disconnected')
    gpioClients = gpioClients.filter((client) => client !== socket)
  })

  socket.on('control', (data) => {
    gpioClients.forEach((client) => {
      if (client !== socket) {
        client.emit('control', data)
      }
    })
  })
})

wss.on('connection', (ws) => {
  rtcConnections.push(ws)

  ws.on('message', (message) => {
    rtcConnections.forEach((conn) => {
      if (conn !== ws && conn.readyState === WebSocket.OPEN) {
        conn.send(message)
      }
    })
  })

  ws.on('close', () => {
    rtcConnections = rtcConnections.filter((conn) => conn !== ws)
  })
})

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url

  if (pathname === '/rtc') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(3000, () => {
  console.log('Server is listening on port 3000')
})
