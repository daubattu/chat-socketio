import Home from "../components/Home"
import Auth from "../containers/Auth"

import RequireAuthenticated from "../hoc/RequireAuthenticated"

const indexRouters = [
  {
    path: "/",
    exact: true,
    component: RequireAuthenticated(Home)
  },
  {
    path: "/auth",
    component: Auth
  }
]

export default indexRouters