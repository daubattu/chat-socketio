import jwt from "jsonwebtoken"

export function setCurrentUser(tokenJWT) {
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