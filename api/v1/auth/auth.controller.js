import jwt from "jsonwebtoken"
import User from "../../../models/User"
import fs from "fs"
import path from "path"

import { SECRET_KEY_JWT } from "../../../configs"
import TokenNotification from "../../../models/TokenNotification"
import Group from "../../../models/Group";

const staticFolder = path.resolve(__dirname, "../../../public/images")

function uploadImages(arrayImages) {
  let images = []

  console.log("arrayImages.length", arrayImages.length)
  for (let i = 0; i < arrayImages.length; i++) {
    const image = arrayImages[i]
    if (image.includes("base64")) {
      const data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, "")
      const mime = image.match(/^data:image\/(png|gif|jpeg);base64,/)[1]
      const timeString = new Date().getTime().toString() + i.toString()
      const name = `${timeString}.${mime}`

      images.push("/images/" + name)

      try {
        fs.writeFileSync(`${staticFolder}/${name}`, data, 'base64', error => {
          if (error) console.log(error)
        })
      } catch (error) { console.log(error) }
    }
  }
  return images
}

async function Login(request, response) {
  try {
    let user = await User.findOne({ email: request.body.email })

    if (user) {
      if (user.comparePassword(request.body.password)) {
        let newTokenNotification = new TokenNotification({
          user: user._id,
          device: request.headers["user-agent"],
          sockets: [],
          value: request.body.tokenNotification || null
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

        return response.status(200).json({ status: 200, tokenJWT, user: { _id: user._id, username: user.username, avatar: user.avatar, name: user.name } })
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

    console.log(decoded, tokenNotification)

    if (!tokenNotification) {
      return response.status(404).json({ status: 404, message: "Không tìm thấy token thiết bị" })
    }

    tokenNotification.remove()

    let numberOfSocket = 0
    const tokenNotifications = await TokenNotification.find({ user: user._id, _id: { $ne: tokenNotification._id } })

    if (tokenNotifications) {
      for (let itemTokenNotification of tokenNotifications) {
        if (itemTokenNotification.sockets) numberOfSocket += itemTokenNotification.sockets.length
      }
    }

    console.log(numberOfSocket)

    if (numberOfSocket === 0) {
      const friends = await User.find({ _id: { $in: user.friends }, online: true }, "")

      for (let friend of friends) {
        // Get total tokenNotifications of user frined
        const tokenNotificationsOfFriends = await TokenNotification.find({ user: friend._id })
        for (let tokenNotificationsOfFriend of tokenNotificationsOfFriends) {
          if (tokenNotificationsOfFriend.sockets) {
            for (let socketOfFriend of tokenNotificationsOfFriend.sockets) {
              io.to(socketOfFriend).emit("yourFriendOffline", { _id: user._id, name: user.name, username: user.username, avatar: user.avatar, latestTimeConnection: Date.now() })
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

async function Signup(request, response) {
  try {
    const existedUser = await User.findOne({ email: request.body.email })

    if (existedUser) {
      return response.status(400).json({ status: 400, message: "Email đã được sử dụng" })
    }

    const newUser = new User({
      username: Date.now(),
      email: request.body.email,
      name: request.body.name,
      password: request.body.password,
      avatar: uploadImages([request.body.avatar])[0]
    })

    await newUser.save()

    const users = await User.find({ _id: { $ne: newUser._id } })

    for (let user of users) {
      user.friends.push(newUser._id)
      newUser.friends.push(user._id)
      const newGroup = new Group({
        members: [user._id, newUser._id]
      })

      newGroup.save()
      user.save()
    }

    newUser.save()
    return response.status(200).json({ status: 200 })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }

}

async function ChangePassword(request, response) {
  let { decoded } = request

  try {
    const user = await User.findById(decoded._id)

    if (!user) {
      return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })
    }

    if (!user.comparePassword(request.body.oldPassword)) {
      return response.status(400).json({ status: 400, message: "Mật khẩu cũ không chính xác" })
    }

    user.password = request.body.newPassword
    user.save()

    return response.status(200).json({ status: 200 })
  } catch (error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  Login,
  Logout,
  Signup,
  ChangePassword
}