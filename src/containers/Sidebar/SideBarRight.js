import React, { Component, Fragment } from "react"
import SideBarRight from "../../components/SideBar/SideBarRight/index"
import axios from "axios";
import { connect } from "react-redux"
import { initFriends } from "../../actions/friends"
import { setCurrentGroup } from "../../actions/group"

class SideBarRightContainer extends Component {

  state = {
    params: {}
  }

  getFriends = async (params = {}) => {
    params = {
      ...this.state.params,
      ...params
    }

    let { friends } = []

    await axios.get("/api/v1/me/friends", { params })
      .then(response => {
        friends = response.data.friends || []
      }, () => {})
    
    return friends
  }

  async componentDidMount() {
    const friendsOnline = await this.getFriends()
    this.props.initFriends(friendsOnline)
  }

  render() {
    const { friends, setCurrentGroup } = this.props
    return (
      <Fragment>
        <SideBarRight setCurrentGroup={setCurrentGroup} friends={ friends.filter ? friends.filter : friends.all } />
      </Fragment>
    )
  }
}


function mapStateToProps(state) {
  return {
    friends: state.friends
  }
}

export default connect(mapStateToProps, { initFriends, setCurrentGroup })(SideBarRightContainer)