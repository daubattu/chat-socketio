import React, { Component, Fragment } from "react"
import { Route, Switch } from "react-router-dom"
import authRouters from "../../routers/auth"

class Auth extends Component {
  render() {
    return (
      <Fragment>
        <Switch>
          {
            authRouters.map((router, index) => {
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
      </Fragment>
    )
  }
}

export default Auth