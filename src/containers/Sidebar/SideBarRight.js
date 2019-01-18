import React, { Component, Fragment } from "react"
import SideBarRight from "../../components/SideBar/SideBarRight/index"
import axios from "axios";
import { connect } from "react-redux"
import { initFriendsOnline } from "../../actions/friends"

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
    this.props.initFriendsOnline(friendsOnline)
  }

  render() {
    const { friends } = this.props
    return (
      <Fragment>
        <SideBarRight friends={ friends.filter ? friends.filter : friends.online } />
      </Fragment>
    )
  }
}


function mapStateToProps(state) {
  return {
    friends: state.friends
  }
}

export default connect(mapStateToProps, { initFriendsOnline })(SideBarRightContainer)