import jwt from "jsonwebtoken"

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
            avatar: decoded.avatar
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
  return {
    type: "AUTH_USER_LOG_OUT"
  }
}