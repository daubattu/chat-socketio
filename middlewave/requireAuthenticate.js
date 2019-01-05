import jwt from "jsonwebtoken"
import User from "../models/User"
import { SECRET_KEY_JWT } from "../configs"

export default (request, response, next) => {
  const authorizationHeader = request.headers["authorization"]

  const token = authorizationHeader ? authorizationHeader.split(" ")[1] : null

  if (token) {
    jwt.verify(token, SECRET_KEY_JWT, async (error, decode) => {
      if (error) {
        return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
      } else {
        try {
          let user = await User.findById(decode._id)

          if (!user) {
            return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })
          }

          if (user.status) {
            request.authenticate = user
            return next()
          } else {
            return response.status(401).json({ status: 401, message: "Tài khoản của bạn đã bị xóa khỏi hệ thống" })
          }
        } catch (error) {
          return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
        }
      }
    })
  } else {
    return response.status(401).json({ status: 401, message: "Bạn chưa đăng nhập" })
  }
}
