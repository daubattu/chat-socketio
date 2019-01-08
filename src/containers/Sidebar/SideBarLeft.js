import React, { Component, Fragment } from "react"
import axios from "axios"
import { connect } from "react-redux"

import Groups from "../../components/SideBar/SideBarLeft/Groups"
import { setCurrentGroup } from "../../actions/group"
import { initGroups } from "../../actions/groups"

class SideBarLeftContainer extends Component {
  async componentDidMount() {
    this.mounted  = true
    await axios.get("/api/v1/groups")
      .then(responses => {
        const groups = responses.data.groups || []
        if(this.mounted) {
          this.props.initGroups(groups)
          this.props.setCurrentGroup(groups[0])
        }
      }, () => {
        this.setState({ groups: [] })
      })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  isMe = userId => {
    if(this.props.currentUser._id === userId) 
      return true
    return false
  }

  render() {
    const { groups } = this.props

    return (
      <nav className="col-md-3 bg-light sidebar">
        <div className="sidebar-sticky">
          <div className="pt-3 px-4">
            <h2>Groups</h2>
            <Groups currentUser={this.props.currentUser} isMe={this.isMe} groups={groups} setCurrentGroup={this.props.setCurrentGroup}/>
          </div>
        </div>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    groups: state.groups,
    currentUser: state.auth.user
  }
}
export default connect(mapStateToProps, { setCurrentGroup, initGroups })(SideBarLeftContainer)