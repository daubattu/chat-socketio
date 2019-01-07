import React, { Component } from "react"
import { connect } from "react-redux"

export default function (ComposedComponent) {
  class RequireAuthenticated extends Component {
    componentDidMount() {
      if(!this.props.isAuthenticated) {
        this.props.history.push("/auth/login")
      }
    }
    render() {
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

  return connect(mapStateToProps, null)(RequireAuthenticated)
}
