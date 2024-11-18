import 'dotenv/config'
import express from 'express'
import logger from './logger.js'
import morgan from 'morgan'

const app = express()

const port = process.env.PORT || 3000

// app.get("/", (req, res) => {
//   res.send("Hello there, this is an api response from a backend appln!")
// })

// app.get("/test-nodemon", (req, res) => {
//   res.send("Hello there, this is an api response to test nodemon")
// })

app.use(express.json())

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

let teaData = []
let nextId = 1

app.post('/teas', (req, res) => {
  logger.info("A new post data");
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


// logger.info("This is an info message");
// logger.error("This is an error message");
// logger.warn("This is a warning message");
// logger.debug("This is a debug message");