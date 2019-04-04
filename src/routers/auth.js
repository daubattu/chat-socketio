import Login from "../containers/Auth/Login"
import Signup from "../containers/Auth/Signup"
import ChangePassword from "../containers/Auth/ChangePassword";

import RequireAuthenticated from "../hoc/RequireAuthenticated"

const authRouters = [
  {
    path: "/auth/login",
    exact: true,
    component: Login
  },
  {
    path: "/auth/signup",
    component: Signup
  },
  {
    path: "/auth/change-password",
    component: RequireAuthenticated(ChangePassword)
  }
]

export default authRouters