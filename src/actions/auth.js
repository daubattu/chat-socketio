import jwt from "jsonwebtoken"
import axios from "axios"

export function setCurrentUser(tokenJWT) {
  let user = {}

  if (tokenJWT) {
    jwt.verify(tokenJWT, "tobeornottobe", (error, decoded) => {
      if (error) { }
      else {
        if (decoded) {
          user = {
            _id: decoded._id,
            username: decoded.username,
            avatar: decoded.avatar,
            name: decoded.name
          }
        }
      }
    })
  }

  return {
    type: "AUTH_SET_CURRENT_USER",
    user
  }
}

export function handleLogOut() {
  localStorage.removeItem("tokenJWT")
  axios.get("/api/v1/auth/logout")
  return {
    type: "AUTH_USER_LOG_OUT"
  }
}