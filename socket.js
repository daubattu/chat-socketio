import socketIO from "socket.io"
import jwt from "jsonwebtoken"
import _ from "lodash"
import User from "./models/User"

import { SECRET_KEY_JWT } from "./configs"
import TokenNotification from "./models/TokenNotification";
import Group from "./models/Group";
import Message from "./models/Message";

// function đếm số lượng socket mà người dùng đang kết nối
const countNumberSocketOfUser = async (userId, socketId) => {
  const tokenNotificationsOfUser = await TokenNotification.find({ user: userId })

  let numberSocketOfUser = 0

  if (tokenNotificationsOfUser) {
    for (let tokenNotificationOfUser of tokenNotificationsOfUser) {
      const numberSocketOfTokenNotification = tokenNotificationOfUser.sockets ? tokenNotificationOfUser.sockets.filter(socket => socket !== socketId) : []
      numberSocketOfUser += numberSocketOfTokenNotification.length
    }
  }

  return numberSocketOfUser
}

// function emit event user's friend online/offline
const emitFriendOnLineOrOffline = async (socket, user, eventName, dataEmit) => {
  const friends = await User.find({ _id: { $in: user.friends }, online: true }, "_id")

  for (let friend of friends) {
    // Get total tokenNotifications of user friend
    const tokenNotificationsOfFriends = await TokenNotification.find({ user: friend._id })

    for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
      if (tokenNotificationsOfFriend.sockets && tokenNotificationsOfFriend.sockets.length !== 0) {
        for (let socketOfFriend of tokenNotificationsOfFriend.sockets) {
          if (io.sockets.connected[socketOfFriend]) {
            if (eventName === "yourFriendOnline") {
              const group = await user.getGroupChatWithFriend(friend._id)
              dataEmit = {
                ...dataEmit,
                group
              }
            }

            socket.to(socketOfFriend).emit(eventName, dataEmit)
          }
        }
      }
    }
  }
}

// function đánh đấu đã đọc tin nhắn của 1 group của user có _id = socket.decode._id
const markMessageReaded = async (groupId, socket) => {
  const group = await Group.findOne({ _id: groupId, members: socket.decoded._id })

  if (group) {
    const latestMessage = await Message.findOne({ group: groupId, memberReaded: { $ne: socket.decoded._id } }).sort({ createdTime: -1 })

    if (latestMessage) {
      let indexOfMemberReaded = _.findIndex(latestMessage.memberReaded, member => member.toString() === socket.decoded._id.toString())

      if (indexOfMemberReaded === -1) {
        socket.to(groupId).emit('readedLastMessage', { user: { _id: socket.decoded._id, name: socket.decoded.name || socket.decoded.username, avatar: socket.decoded.avatar } })
      }

      const messages = await Message.find({ group: groupId, memberReaded: { $ne: socket.decoded._id } })

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

// Init socket 
const socket = server => {
  const io = socketIO(server)

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

                  const numberSocketOfUser = await countNumberSocketOfUser(user._id, socket.id)

                  // Nếu tổng socket của người dùng hiện tại là 0, sau khi connect socket này sẽ là 1 thì emit event online tới friend of user
                  if (numberSocketOfUser === 0) {
                    emitFriendOnLineOrOffline(socket, user, "yourFriendOnline", { _id: user._id, name: user.name, username: user.username, avatar: user.avatar })

                    if (!user.online) {
                      user.online = true
                      user.latestTimeConnection = 0
                    }

                    user.save()
                  }

                  if (!tokenNotification.sockets) tokenNotification.sockets = []
                  tokenNotification.sockets = tokenNotification.sockets.filter(sid => {
                    if (io.sockets.sockets[sid]) {
                      return sid
                    }
                  })

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
            markMessageReaded(data.groupId, socket)
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
            socket.to(data.groupId).emit('typing', { user: { _id: socket.decoded._id, name: socket.decoded.name, avatar: socket.decoded.avatar } })
            markMessageReaded(data.groupId, socket)
          }
        }
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("unTyping", data => {
      if (data) {
        if(socket.decoded) {
          socket.to(data.groupId).emit('unTyping', { user: { _id: socket.decoded._id, name: socket.decoded.name, avatar: socket.decoded.avatar } })
        }
      }
    })

    socket.on("disconnect", async () => {
      const { decoded } = socket

      // check socket đã authenticate thành công chưa, nếu đã thành công thì xóa socket trong mảng sockets model TokenNotification
      if (decoded) {
        setTimeout(async () => {
          let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)

          if (tokenNotification && tokenNotification.sockets) {
            const indexOfSocket = _.findIndex(tokenNotification.sockets, itemSocket => itemSocket === socket.id)

            if (indexOfSocket !== -1) {
              tokenNotification.sockets.splice(indexOfSocket, 1)
              tokenNotification.markModified("sockets")
              await tokenNotification.save()
            }
          }

          let user = await User.findById(decoded._id)

          if (user) {
            socket.decoded = decoded

            const numberSocketOfUser = await countNumberSocketOfUser(user._id, socket.id)

            // Nếu tổng socket của người dùng hiện tại là 0 sau khi đã splice socket này sẽ là 1 thì emit event offline tới friend of user
            if (numberSocketOfUser === 0) {
              emitFriendOnLineOrOffline(socket, user, "yourFriendOffline", { _id: user._id, name: user.name, username: user.username, avatar: user.avatar })

              if (user.online) {
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

  return io
}

// export io to use in index.js
export default socket