import React, { Component } from "react"
import { connect } from "react-redux"
import { handleLogOut } from "../actions/auth"

export default function (ComposedComponent) {
  class RequireAuthenticated extends Component {
    componentDidMount() {
      this.checkAuthenticate()
    }

    componentDidUpdate() {
      this.checkAuthenticate()
    }

    checkAuthenticate = () => {
      if(!this.props.isAuthenticated) {
        this.props.handleLogOut()
        this.props.history.push("/auth/login")
      }
    }

    render() {
      if(!this.props.isAuthenticated) return null
      return (
        <ComposedComponent {...this.props} />
      )
    }
  }

  function mapStateToProps(state) {
    return {
      isAuthenticated: state.auth.isAuthenticated
    }
  }

  return connect(mapStateToProps, { handleLogOut })(RequireAuthenticated)
}
