const express = require('express')
const axios = require('axios')
const path = require('path')
const app = express()
const port = 3000

const raspberries = {}

app.use(express.json())

app.post('/register', (req, res) => {
  const { id, ip } = req.body
  raspberries[id] = ip
  res.send('Raspberry Pi registrada')
})

app.get('/raspberries', (req, res) => {
  const raspberryList = Object.keys(raspberries).map((id) => ({
    id,
    ip: raspberries[id],
  }))
  res.json(raspberryList)
})

app.get('/gpio/:id/:pin/:state', async (req, res) => {
  const id = parseInt(req.params.id)
  const pin = req.params.pin
  const state = req.params.state

  const ip = raspberries[id]
  if (!ip) {
    return res.status(404).send('Raspberry Pi no encontrada')
  }

  try {
    const response = await axios.get(`http://${ip}:5000/gpio/${pin}/${state}`)
    res.send(response.data)
  } catch (error) {
    res.status(500).send('Error al comunicarse con la Raspberry Pi')
  }
})

// Servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, () => {
  console.log(`Servidor central escuchando en http://localhost:${port}`)
})
