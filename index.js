const express = require('express')
const app = express()
const path = require('path')
const port = 3000

app.use(express.json())

let gpioStates = {} // Para almacenar el estado de los GPIO de cada Raspberry Pi

app.post('/api/raspberry/:id/gpio', (req, res) => {
  const { id } = req.params
  const { device, state } = req.body

  if (!gpioStates[id]) {
    gpioStates[id] = {}
  }

  gpioStates[id][device] = state
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

app.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})
