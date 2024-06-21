const express = require('express')
const axios = require('axios')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

let raspberries = {}

app.use(express.json())

// Endpoint para registrar las Raspberry Pis
app.post('/register', (req, res) => {
  try {
    const { id, ip } = req.body
    if (!id || !ip) {
      return res.status(400).send('ID o IP faltantes en la solicitud')
    }
    raspberries[id] = ip
    console.log(`Raspberry Pi ${id} registrada con IP ${ip}`)
    console.log('Estado actual de raspberries:', raspberries)
    res.send('Raspberry Pi registrada')
  } catch (error) {
    console.error('Error al registrar la Raspberry Pi:', error.message)
    res.status(500).send('Error al registrar la Raspberry Pi')
  }
})

// Endpoint para obtener la lista de Raspberry Pis registradas
app.get('/raspberries', (req, res) => {
  try {
    const raspberryList = Object.keys(raspberries).map((id) => ({
      id,
      ip: raspberries[id],
    }))
    console.log('Enviando lista de raspberries:', raspberryList)
    res.json(raspberryList)
  } catch (error) {
    console.error('Error al obtener la lista de Raspberry Pis:', error.message)
    res.status(500).send('Error al obtener la lista de Raspberry Pis')
  }
})

// Endpoint para controlar los pines GPIO de las Raspberry Pis
app.get('/gpio/:id/:pin/:state', async (req, res) => {
  const id = parseInt(req.params.id)
  const pin = req.params.pin
  const state = req.params.state

  const ip = raspberries[id]
  if (!ip) {
    console.log(`Raspberry Pi ${id} no encontrada`)
    return res.status(404).send('Raspberry Pi no encontrada')
  }

  try {
    console.log(
      `Enviando solicitud a Raspberry Pi ${id} en ${ip} para pin ${pin} ${state}`
    )
    const response = await axios.get(`http://${ip}:5000/gpio/${pin}/${state}`)
    res.send(response.data)
  } catch (error) {
    console.error(
      `Error al comunicarse con la Raspberry Pi ${id} en ${ip}:`,
      error.message
    )
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
