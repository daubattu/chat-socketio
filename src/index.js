import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Provider } from "react-redux"
import routers from "./routers"
import { setAuthorizationHeader } from "./utills"
import { setCurrentUser, handleLogOut } from "./actions/auth"
import store from "./store"

if(localStorage.tokenJWT) {
  store.dispatch(setCurrentUser(localStorage.tokenJWT))
} else {
  store.dispatch(handleLogOut())
}

setAuthorizationHeader(localStorage.tokenJWT)

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        {
          routers.map((router, index) => {
            return (
              <Route
                key={index}
                exact={router.exact}
                path={router.path}
                component={router.component} />
            )
          })
        }
      </Switch>
    </Router>
  </Provider>,
  document.getElementById("app")
)