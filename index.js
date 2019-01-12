import express from "express"
import http from "http"
import socketIO from "socket.io"
import mongoose from "mongoose"
import logger from "morgan"
import bodyParser from "body-parser"
import path from "path"
// import redis from "redis"

import { PORT, MONGO_URL } from "./configs"
import routers from "./routers"

const app = express()
const server = http.Server(app)
const io = socketIO(server)

// define golobal variable io to access in routers
global.io = io

// define redis client
// const client = redis.createClient()
// client.on('connect', () => console.log('Redis client connected successful'))
// client.on('error', error => console.log('Redis client connected fail' + error))

// set static folder 
app.use(logger("dev"))
app.use(express.static("public"))
app.use(bodyParser.json({ limit: "50MB" }))
app.use(bodyParser.urlencoded({ limit: "50MB", extended: true }))

// define routers
routers(app)

app.get("/*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "public/index.html"))
})

server.listen(PORT, error => {
  if (error) {
    console.log(error)
    return
  }
  mongoose.Promise = Promise
  mongoose.connect(MONGO_URL, { useNewUrlParser: true })
    .then(
      () => console.log("Server is running in port 3000"),
      error => console.log("Can't connect to " + MONGO_URL, error)
    )
})

io.on("connection", socket => {
  // let connecting = client.get("connecting") || []

  // if(connecting.)
  // client.set("connecting", "1234")

  // console.log(client.get("connecting"))

  console.log("***_", socket.id, "connection", "_***")

  socket.on("joinRoom", data => {
    socket.join(data.groupId)
    socket.to(data.groupId).emit("newConnection", socket.id + " have just connected to" + data.groupId)
  })
  socket.on("leaveRoom", data => {
    socket.to(data.groupId).emit('unTyping')
    socket.leave(data.groupId)
  })
  socket.on("typing", data => {
    if(data)
      socket.to(data.groupId).emit('typing')
  })
  socket.on("unTyping", data => {
    if(data)
      socket.to(data.groupId).emit('unTyping')
  })
  socket.on("disconnect", function () {
    const keys = Object.keys(socket.rooms)

    for (let i = 0; i < keys.length; i++) {
      socket.leave(socket.rooms[keys[i]])
    }
    console.log("***_", socket.id, "disconnect", "_***")
  });
})
