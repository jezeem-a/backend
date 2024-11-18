// create an http
const http = require('http');

// localhost
const hostname = '127.0.0.1'; 
// port or a gateway
const port = 3000

// create server
const server = http.createServer((req, res) => {
  if (req.url == '/') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end("Hello node.js")
  } else if (req.url == '/jezeem') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end("Hello Jezeem")
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end("404 Not found")
  }
})

// make the server to listen for req
server.listen(port, hostname, () => {
  console.log(`Server is listening at http://${hostname}:${port}`)
})