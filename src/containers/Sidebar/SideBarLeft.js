import React, { Component, Fragment } from "react"
import axios from "axios"
import { connect } from "react-redux"

import Groups from "../../components/SideBar/SideBarLeft/Groups"
import { setCurrentGroup } from "../../actions/group"

class SideBarLeftContainer extends Component {
  state = {
    groups: []
  }
  async componentDidMount() {
    await axios.get("/api/v1/groups")
      .then(responses => {
        const groups = responses.data.groups || []
        this.setState({ groups })
        this.props.setCurrentGroup(groups[0])
      }, () => {
        this.setState({ groups: [] })
      })
  }
  render() {
    const { groups } = this.state
    
    return (
      <nav className="col-md-3 bg-light sidebar">
        <div className="sidebar-sticky">
          <div className="pt-3 px-4">
            <h2>#sidebar</h2>
            { groups && <Groups groups={groups} setCurrentGroup={this.props.setCurrentGroup}/> }
          </div>
        </div>
      </nav>
    )
  }
}

export default connect(null, { setCurrentGroup })(SideBarLeftContainer)