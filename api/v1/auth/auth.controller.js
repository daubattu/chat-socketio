import jwt from "jsonwebtoken"
import User from "../../../models/User"

import { SECRET_KEY_JWT } from "../../../configs"
// import { detectDevice } from "../../../middlewave"
import TokenNotification from "../../../models/TokenNotification";
import UserFriend from "../../../models/UserFriend"

async function Login(request, response) {
  try {
    let user
    user = await User.findOne({
      email: request.body.email
    })

    if (user) {
      if (user.comparePassword(request.body.password)) {
        let newTokenNotification = new TokenNotification({
          user: user._id,
          device: request.headers["user-agent"],
          sockets: []
        })

        await newTokenNotification.save()

        if (!newTokenNotification._id) {
          return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error: { message: "Lỗi mã hóa thông tin người dùng" } })
        }

        const tokenJWT = jwt.sign({
          _id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          tokenNotification: newTokenNotification._id
        }, SECRET_KEY_JWT)

        return response.status(200).json({ status: 200, tokenJWT, user: { _id: user._id, username: user.username, avatar: user.avatar } })
      } else {
        return response.status(400).json({ status: 400, message: "Mật khẩu không chính xác" })
      }
    } else return response.status(404).json({ status: 400, message: "Người dùng không tồn tại" })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Some thing wrong", error })
  }
}

async function Logout(request, response) {
  let { decoded } = request

  try {
    const user = await User.findById(decoded._id)

    if (!user) return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })

    const tokenNotification = await TokenNotification.findById(decoded.tokenNotification)

    if (tokenNotification) tokenNotification.remove()

    let numberOfSocket = 0
    const tokenNotifications = await TokenNotification.find({ user: user._id, _id: { $ne: tokenNotification._id } })

    if (tokenNotifications) {
      for (let itemTokenNotification of tokenNotifications) {
        if (itemTokenNotification.sockets) numberOfSocket += itemTokenNotification.sockets.length
      }
    }

    console.log(numberOfSocket)
    
    if (numberOfSocket === 0) {
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
      user.online = false
      user.latestTimeConnection = Date.now()
      user.save()
    }

    return response.status(200).json({ status: 200 })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  Login,
  Logout
}