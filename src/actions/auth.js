import jwt from "jsonwebtoken"
import { setAuthorizationHeader } from "../utills/index"

export function setCurrentUser(tokenJWT) {
  localStorage.setItem("tokenJWT", tokenJWT)
  setAuthorizationHeader(tokenJWT)

  const { _id, username, avatar } = jwt.decode(tokenJWT)
  const user = { _id, username, avatar }
  
  return {
    type: "AUTH_SET_CURRENT_USER",
    user
  }
}

export function handleLogOut() {  
  return {
    type: "AUTH_USER_LOG_OUT"
  }
}