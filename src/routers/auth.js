import Login from "../containers/Auth/Login"
import Signup from "../containers/Auth/Signup"

const authRouters = [
  {
    path: "/auth/login",
    exact: true,
    component: Login
  },
  {
    path: "/auth/signup",
    component: Signup
  }
]

export default authRouters