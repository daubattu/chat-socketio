import jwt from "jsonwebtoken"
import User from "../../../models/User"

import { SECRET_KEY_JWT } from "../../../configs"

async function Login(request, response) {
  try {
    let user
    user = await User.findOne({
      email: request.body.email
    })

    if (user) {
      if (user.comparePassword(request.body.password)) {
        const tokenJWT = jwt.sign({
          _id: user._id,
          username: user.username,
          avatar: user.avatar
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

export {
  Login
}