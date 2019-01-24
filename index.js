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
import Group from "./models/Group";
import Message from "./models/Message";
import UserFriend from "./models/UserFriend";

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
              const user = await User.findById(decoded._id)

              if (!user) {
                errorAuthenticate = {
                  level: "error",
                  message: "Người dùng không tồn tại"
                }
              } else if (user.status !== 1) {
                errorAuthenticate = {
                  level: "error",
                  message: "Người dùng đã bị xóa khỏi hệ thống"
                }
              } else {
                socket.decoded = decoded
                if(!user.online) {
                  user.online = true
                  user.latestTimeConnection = 0
                }
                user.save()
                
                const tokenNotificationsOfUser = await TokenNotification.find({ user: user._id })
                let numberSocketOfUser = 0
                if (tokenNotificationsOfUser) {
                  for (let tokenNotificationOfUser of tokenNotificationsOfUser) {
                    const numberSocketOfTokenNotification = tokenNotificationOfUser.sockets ? tokenNotificationOfUser.sockets.filter(s => s !== socket.id) : []
                    numberSocketOfUser += numberSocketOfTokenNotification.length
                  }
                }

                // Nếu tổng socket của người dùng hiện tại là 0, sau khi connect socket này sẽ là 1 thì emit event online tới friend of user
                if (numberSocketOfUser === 0) {
                  const userFriends = await UserFriend.find({ user: user._id }).populate("friend", "username avatar name")
                  
                  if (userFriends) {
                    for (let userFriend of userFriends) {
                      // Get total tokenNotifications of user friend
                      const tokenNotificationsOfFriends = await TokenNotification.find({ user: userFriend.friend._id })

                      for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
                        console.log("tokenNotificationsOfFriend.sockets", tokenNotificationsOfFriend.sockets)
                        if (tokenNotificationsOfFriend.sockets && tokenNotificationsOfFriend.sockets.length !== 0) {
                          for (let socketOfFriend of tokenNotificationsOfFriend.sockets) {
                            console.log("socketOfFriend", socketOfFriend)
                            if (io.sockets.connected[socketOfFriend]) {
                              const groupChatOfUserAndFriend = await Group.findById(userFriend.group).populate("members", "name avatar username")
                              socket.to(socketOfFriend).emit("yourFriendOnline", { _id: user._id, name: user.name, username: user.username, avatar: user.avatar, group: groupChatOfUserAndFriend })
                            }
                          }
                        }
                      }
                    }
                  }
                }

                if (!tokenNotification.sockets) tokenNotification.sockets = []
                tokenNotification.sockets = tokenNotification.sockets.filter(sid => {
                  if(io.sockets.sockets[sid]) {
                    return sid
                  }
                })

                console.log("tokenNotification.sockets.length is connecting", tokenNotification.sockets.length)

                const indexOfSocket = _.findIndex(tokenNotification.sockets, itemSocket => itemSocket === socket.id)

                if (indexOfSocket === -1) {
                  tokenNotification.sockets.push(socket.id)
                  tokenNotification.markModified("sockets")
                  tokenNotification.save()
                }
              }

              if (errorAuthenticate.level === "error" && tokenNotification) {
                tokenNotification.remove()
              }
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

  socket.on("joinRoom", async data => {
    try {
      if (data) {
        if (socket.decoded) {
          socket.join(data.groupId)
          socket.to(data.groupId).emit("newConnection", socket.id + " have just connected to" + data.groupId)
          const group = await Group.findOne({ _id: data.groupId, members: socket.decoded._id })

          if (group) {
            const latestMessage = await Message.findOne({ group: data.groupId, memberReaded: { $ne: socket.decoded._id } }).sort({ createdTime: -1 })

            if (latestMessage) {
              let indexOfMemberReaded = _.findIndex(latestMessage.memberReaded, member => member.toString() === socket.decoded._id.toString())

              if (indexOfMemberReaded === -1) {
                socket.to(data.groupId).emit('readedLastMessage', { user: { _id: socket.decoded._id, name: socket.decoded.name || socket.decoded.username, avatar: socket.decoded.avatar } })
              }

              const messages = await Message.find({ group: data.groupId, memberReaded: { $ne: socket.decoded._id } })

              if (messages) {
                for (let message of messages) {
                  if ((message.user !== socket.decoded._id) && message.memberReaded) {
                    let indexOfMemberReaded = _.findIndex(message.memberReaded, member => member.toString() === socket.decoded._id)

                    if (indexOfMemberReaded === -1) {
                      message.memberReaded.push(socket.decoded._id)
                      message.markModified("memberReaded")
                      message.save()
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("leaveRoom", data => {
    socket.to(data.groupId).emit('unTyping')
    socket.leave(data.groupId)
  })

  socket.on("typing", async data => {
    try {
      if (data) {
        if (socket.decoded) {
          socket.to(data.groupId).emit('typing', { user: { _id: socket.decoded._id, name: socket.decoded.name || socket.decoded.username, avatar: socket.decoded.avatar } })
          const group = await Group.findOne({ _id: data.groupId, members: socket.decoded._id })

          if (group) {
            const latestMessage = await Message.findOne({ group: data.groupId, memberReaded: { $ne: socket.decoded._id } }).sort({ createdTime: -1 })

            if (latestMessage) {
              let indexOfMemberReaded = _.findIndex(latestMessage.memberReaded, member => member.toString() === socket.decoded._id.toString())

              if (indexOfMemberReaded === -1) {
                socket.to(data.groupId).emit('readedLastMessage', { user: { _id: socket.decoded._id, name: socket.decoded.name || socket.decoded.username, avatar: socket.decoded.avatar } })
              }

              const messages = await Message.find({ group: data.groupId, memberReaded: { $ne: socket.decoded._id } })

              if (messages) {
                for (let message of messages) {
                  if ((message.user !== socket.decoded._id) && message.memberReaded) {
                    let indexOfMemberReaded = _.findIndex(message.memberReaded, member => member.toString() === socket.decoded._id)

                    if (indexOfMemberReaded === -1) {
                      message.memberReaded.push(socket.decoded._id)
                      message.markModified("memberReaded")
                      message.save()
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("unTyping", data => {
    if (data)
      socket.to(data.groupId).emit('unTyping')
  })

  socket.on("disconnect", async () => {
    const { decoded } = socket

    // check socket đã authenticate thành công chưa, nếu đã thành công thì xóa socket trong mảng sockets model TokenNotification
    if (decoded) {
      setTimeout(async () => {
        let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)

        console.log("tokenNotification", tokenNotification.sockets)

        if (tokenNotification && tokenNotification.sockets) {
          let indexOfSocket = -1
          for (let i = 0; i < tokenNotification.sockets.length; i++) {
            if (tokenNotification.sockets[i] === socket.id) {
              indexOfSocket = i
              break
            }
          }

          console.log("indexOfSocket", indexOfSocket)

          if (indexOfSocket !== -1) {
            tokenNotification.sockets.splice(indexOfSocket, 1)
            tokenNotification.markModified("sockets")
            await tokenNotification.save()
          }
        }

        let user = await User.findById(decoded._id)

        if (user) {
          socket.decoded = decoded
          const tokenNotificationsOfUser = await TokenNotification.find({ user: user._id })
          let numberSocketOfUser = 0
          if (tokenNotificationsOfUser) {
            for (let tokenNotificationOfUser of tokenNotificationsOfUser) {
              numberSocketOfUser += tokenNotificationOfUser.sockets ? tokenNotificationOfUser.sockets.length : 0
            }
          }

          // Nếu tổng socket của người dùng hiện tại là 0 sau khi đã splice socket này sẽ là 1 thì emit event offline tới friend of user
          if (numberSocketOfUser === 0) {
            const userFriends = await UserFriend.find({ user: user._id }).populate("friend", "username avatar name")

            if (userFriends) {
              for (let userFriend of userFriends) {
                // Get total tokenNotifications of user frined
                const tokenNotificationsOfFriends = await TokenNotification.find({ user: userFriend.friend._id })
                for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
                  if (tokenNotificationsOfFriend.sockets) {
                    for (let socketOfFriend of tokenNotificationsOfFriend.sockets) {
                      io.to(socketOfFriend).emit("yourFriendOffline", { _id: user._id, name: user.name, username: user.username, avatar: user.avatar, latestTimeConnection: Date.now() })
                    }
                  }
                }
              }
            }

            if(user.online) {
              user.online = false
              user.latestTimeConnection = Date.now()
            }
            user.save()
          }
        }
      }, 5000)
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
    if (!socket.decoded) {
      console.log(socket.id, " [UNAUTHORIRED]")
      socket.emit("unauthorized", errorAuthenticate)
      socket.disconnect()
    }
  }, 5000)
})