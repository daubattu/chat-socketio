import jwt from "jsonwebtoken"
import User from "../../../models/User"

import { SECRET_KEY_JWT } from "../../../configs"
// import { detectDevice } from "../../../middlewave"
import TokenNotification from "../../../models/TokenNotification";

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

    if(tokenNotification) tokenNotification.remove()

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