import React, { Component } from "react"

export default function (ComposedComponent) {
  class RequireAuthenticated extends Component {
    componentDidMount() {
      if(!localStorage.tokenJWT) {
        this.props.history.push("/auth/login")
      }
    }

    render() {
      return (
        <ComposedComponent {...this.props} />
      )
    }
  }

  return RequireAuthenticated
}
