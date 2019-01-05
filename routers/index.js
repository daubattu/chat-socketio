import userRouters from "../api/v1/user/user.router"
import groupRouters from "../api/v1/group/group.router"
import authRouters from "../api/v1/auth/auth.router"

export default app => {
  app.use("/api/v1/users", userRouters)
  app.use("/api/v1/groups", groupRouters)
  app.use("/api/v1/auth", authRouters)
}