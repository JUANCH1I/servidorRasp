const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let clients = {}

wss.on('connection', (ws, req) => {
  const id = req.url.replace('/?', '')
  clients[id] = ws
  ws.on('message', (message) => {
    console.log(`Received message from ${id}: ${message}`)
  })
  ws.on('close', () => {
    delete clients[id]
  })
})

app.post('/api/raspberry/:id/gpio', (req, res) => {
  const { id } = req.params
  const { device, state } = req.body
  if (clients[id]) {
    clients[id].send(JSON.stringify({ device, state }))
  }
  res
    .status(200)
    .send(
      `GPIO del dispositivo ${device} en Raspberry Pi ${id} configurado a ${state}`
    )
})

server.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})
