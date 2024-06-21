const express = require('express')
const axios = require('axios')
const fs = require('node:fs')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

const raspberriesFilePath = 'raspberries.json'

app.use(express.json())

// Leer la lista de Raspberry Pis desde el archivo
const loadRaspberries = () => {
  if (fs.existsSync(raspberriesFilePath)) {
    const data = fs.readFileSync(raspberriesFilePath)
    return JSON.parse(data)
  }
  return {}
}

// Guardar la lista de Raspberry Pis en el archivo
const saveRaspberries = (raspberries) => {
  fs.writeFileSync(raspberriesFilePath, JSON.stringify(raspberries, null, 2))
}

// Endpoint para registrar las Raspberry Pis
app.post('/register', (req, res) => {
  const { id, ip } = req.body
  const raspberries = loadRaspberries()
  raspberries[id] = ip
  saveRaspberries(raspberries)
  console.log(`Raspberry Pi ${id} registrada con IP ${ip}`)
  res.send('Raspberry Pi registrada')
})

// Endpoint para obtener la lista de Raspberry Pis registradas
app.get('/raspberries', (req, res) => {
  const raspberries = loadRaspberries()
  const raspberryList = Object.keys(raspberries).map((id) => ({
    id,
    ip: raspberries[id],
  }))
  console.log('Enviando lista de raspberries:', raspberryList)
  res.json(raspberryList)
})

// Endpoint para controlar los pines GPIO de las Raspberry Pis
app.get('/gpio/:id/:pin/:state', async (req, res) => {
  const id = parseInt(req.params.id)
  const pin = req.params.pin
  const state = req.params.state

  const raspberries = loadRaspberries()
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
