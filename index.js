import express from "express"
import http from "http"
import socketIO from "socket.io"

const app = express()
const server = http.Server(app)
const io = socketIO(server)

app.use(express.static("public"))

app.get("/*", (request, response) => {
  response.sendFile(__dirname, "/public/index.html")
})

server.listen(3000, error => {
  if(error) {
    console.log(error)
    return
  }
  console.log("Server is running in port 3000")
})

io.on('connection', socket => {
  socket.emit('news', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  console.log("new connection")
})
