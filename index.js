const NodeMediaServer = require('node-media-server')
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let controlClients = []

wss.on('connection', (ws, req) => {
  controlClients.push(ws)

  ws.on('message', (message) => {
    const msg = JSON.parse(message)
    if (msg.type === 'control') {
      controlClients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      })
    }
  })

  ws.on('close', () => {
    controlClients = controlClients.filter((client) => client !== ws)
  })
})

app.post('/api/raspberry/gpio', (req, res) => {
  const { command } = req.body
  const instruction = JSON.stringify({ type: 'control', command })
  controlClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(instruction)
    }
  })
  res.status(200).send(`Command ${command} sent to Raspberry Pi`)
})

// Servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
      },
    ],
  },
}

const nms = new NodeMediaServer(config)
nms.run()
