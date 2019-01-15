import express from "express"
import http from "http"
import socketIO from "socket.io"
import mongoose from "mongoose"
import logger from "morgan"
import bodyParser from "body-parser"
import path from "path"
import jwt from "jsonwebtoken"
import _ from "lodash"
import User from "./models/User"
// import redis from "redis"

import { PORT, MONGO_URL, SECRET_KEY_JWT } from "./configs"
import routers from "./routers"
import Token from "./models/TokenNotification";
import TokenNotification from "./models/TokenNotification";

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
  console.log("[CONNECTED] " + socket.id)
  let errorAuthenticate = {}
  socket.decoded = null

  socket.on("authenticate", data => {
    console.log(socket.id, " [AUTHENTICATE]")
    if (data.tokenJWT) {
      jwt.verify(data.tokenJWT, SECRET_KEY_JWT, async (error, decoded) => {
        if (error) {
          console.log(error)
          errorAuthenticate = {
            level: "warning",
            message: "Đã có lỗi xảy ra trong quá trình giải mã token"
          }
        } else {
          if (decoded) {
            let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)

            if (!tokenNotification) {
              errorAuthenticate = {
                level: "error",
                message: "Tài khoản này đã đăng xuất trước đó"
              }
            } else {
              if (!tokenNotification.sockets) tokenNotification.sockets = []
              const indexOfSocket = _.findIndex(tokenNotification.sockets, itemSocket => itemSocket === socket.id)
              // console.log(indexOfSocket)
              if (indexOfSocket === -1) {
                tokenNotification.sockets.push(socket.id)
              }

              tokenNotification.markModified("sockets")

              await tokenNotification.save(async error => {
                if (error) {
                  errorAuthenticate = {
                    level: "error",
                    message: "Oops! Something wrong!"
                  }
                } else {
                  let user = await User.findById(decoded._id).populate("friends", "username avatar")

                  if (user) {
                    socket.decoded = decoded

                    const friends = user.friends || []
                    for (let friend of friends) {
                      const tokenNotificationsOfFriends = await TokenNotification.find({ user: friend._id })
                      for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
                        if (tokenNotificationsOfFriend.sockets.length !== 0) {
                          socket.to(friend._id).emit("yourFriendOnline", friend)
                        }
                      }
                    }
                  } else {
                    errorAuthenticate = {
                      level: "error",
                      message: "Người dùng không tồn tại"
                    }
                  }
                }
              })
            }
          } else {
            errorAuthenticate = {
              level: "error",
              message: "Dữ liệu giải mã không hợp lệ"
            }
          }
        }
      })
    } else {
      errorAuthenticate = {
        level: "warning",
        message: "Không tìm thấy tokenJWT trong dữ liệu truyền lên"
      }
    }
  })

  socket.on("joinRoom", data => {
    socket.join(data.groupId)
    socket.to(data.groupId).emit("newConnection", socket.id + " have just connected to" + data.groupId)
  })

  socket.on("leaveRoom", data => {
    socket.to(data.groupId).emit('unTyping')
    socket.leave(data.groupId)
  })
  socket.on("typing", data => {
    if (data)
      socket.to(data.groupId).emit('typing')
  })
  socket.on("unTyping", data => {
    if (data)
      socket.to(data.groupId).emit('unTyping')
  })
  socket.on("disconnect", async () => {
    const { decoded } = socket

    // check socket đã authenticate thành công chưa, nếu đã thành công thì xóa socket trong mảng sockets model TokenNotification
    if (decoded) {
      let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)

      if (tokenNotification && tokenNotification.sockets) {
        let indexOfSocket = -1
        for (let i = 0; i < tokenNotification.sockets.length; i++) {
          if (tokenNotification.sockets[i] === socket.id) {
            indexOfSocket = i
            break
          }
        }
        if (indexOfSocket !== -1) {
          tokenNotification.sockets.splice(indexOfSocket, 1)
          tokenNotification.markModified("sockets")
          tokenNotification.save()
          const user = await User.findById(decoded._id).populate("friends", "username avatar")

          if (user) {
            const friends = user.friends || []
            for (let friend of friends) {
              // find all tokenNotifications friends of user
              const tokenNotificationsOfFriends = await TokenNotification.find({ user: friend._id })
              for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
                if (tokenNotificationsOfFriend.sockets.length !== 0) {
                  socket.to(friend._id).emit("yourFriendOffline", friend)
                }
              }
            }
          }
        }
      }
    }

    // leave all room socket joined
    const keys = Object.keys(socket.rooms)

    for (let i = 0; i < keys.length; i++) {
      socket.leave(socket.rooms[keys[i]])
    }

    console.info("[DISCONNECTED] " + socket.id)
  })

  // Sau 1s socket chưa authenticate thì disconnect
  setTimeout(function () {
    if (!socket.decoded && errorAuthenticate.message) {
      console.log(socket.id, " [UNAUTHORIRED]")
      socket.emit("unauthorized", { message: errorAuthenticate.message })
      socket.disconnect()
    }
  }, 3000)
})