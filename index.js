const express = require('express')
const app = express()
const path = require('path')
const port = 3000

app.use(express.json())

const totens = [
  {
    id: 1,
    videoUrl: 'http://toten1/video',
    controlUrl: 'http://toten1/control',
  },
  {
    id: 2,
    videoUrl: 'http://toten2/video',
    controlUrl: 'http://toten2/control',
  },
  // Agregar más tótems según sea necesario
]

app.get('/api/totens', (req, res) => {
  res.json(totens)
})

app.post('/api/totens/:id/control', (req, res) => {
  const { id } = req.params
  const { device } = req.body
  const toten = totens.find((t) => t.id == id)
  if (toten) {
    // Aquí se realizarían las acciones necesarias para controlar los dispositivos
    res.status(200).send(`Dispositivo ${device} controlado en Tótem ${id}`)
  } else {
    res.status(404).send('Tótem no encontrado')
  }
})

// Servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})
