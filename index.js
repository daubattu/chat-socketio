import express from "express"
import http from "http"
import socketIO from "./socket"
import mongoose from "mongoose"
import logger from "morgan"
import bodyParser from "body-parser"
import path from "path"
import _ from "lodash"
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