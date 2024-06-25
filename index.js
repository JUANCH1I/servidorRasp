const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let clients = []

wss.on('connection', (ws, req) => {
  clients.push(ws)

  ws.on('message', (message) => {
    // Reenviar el mensaje de video a todos los clientes conectados
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws)
  })
})

app.post('/api/raspberry/:id/gpio', (req, res) => {
  const { id } = req.params
  const { device, state } = req.body
  const instruction = JSON.stringify({ device, state })
  clients.forEach((client) => {
    client.send(instruction)
  })
  res
    .status(200)
    .send(
      `GPIO del dispositivo ${device} en Raspberry Pi ${id} configurado a ${state}`
    )
})

// Servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})
