import express from 'express'

const app = express()

const port = 3000

// app.get("/", (req, res) => {
//   res.send("Hello there, this is an api response from a backend appln!")
// })

// app.get("/test-nodemon", (req, res) => {
//   res.send("Hello there, this is an api response to test nodemon")
// })

app.use(express.json())

let teaData = []
let nextId = 1

app.post('/teas', (req, res) => {
  const { name, price } = req.body
  const newTea = {id: nextId++, name, price}
  teaData.push(newTea)
  res.status(201).send(newTea)
})

app.get('/teas', (req, res) => {
  res.status(200).send(teaData)
})

// find with id
app.get('/teas/:id', (req, res) => {
  const tea = teaData.find(t => t.id === parseInt(req.params.id))
  if(!tea) {
    return res.status(400).send('Tea not found')
  } 
  res.status(200).send(tea)
})

// update data
app.put('/teas/:id', (req, res) => {
  const tea = teaData.find(t => t.id === parseInt(req.params.id))
  if(!tea) {
    return res.status(400).send('Tea not found')
  } 
  const {name, price} = req.body
  tea.name = name
  tea.price = price
  res.send(200).send(tea)
})

// delete
app.delete('/teas/:id', (req,res) => {
  const index = teaData.find(t => t.id === parseInt(req.params.id))
  if(index === -1) {
    return res.status(400).send('Tea not found')
  }
  teaData.splice(index, 1)
  return res.status(200).send('deleted')
})

app.listen(port, () => {
  console.log(`Server is running at port ${port}...`);
})