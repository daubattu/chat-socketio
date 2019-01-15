import React, { Component, Fragment } from "react"
import axios from "axios"
import { connect } from "react-redux"

import Groups from "../../components/SideBar/SideBarLeft/Groups"
import ModalMakeNewgroup from "./Modals/MakeNewGroup"
import { setCurrentGroup } from "../../actions/group"
import { initGroups, handleAddNewGroup } from "../../actions/groups"
import { message, notification } from "antd"

class SideBarLeftContainer extends Component {
  state = {
    newGroup: {},
    openModal: {
      makeNewGroup: false
    },
    isLoading: {
      makeNewGroup: false
    },
    friends: [],
    membersSelected: []
  }

  async componentDidMount() {
    this.mounted = true
    await axios.get("/api/v1/groups")
      .then(responses => {
        const groups = responses.data.groups || []
        if (this.mounted) {
          this.props.initGroups(groups)
          this.props.setCurrentGroup(groups[0])
        }
      }, () => {
        if (this.mounted) {
          this.setState({ groups: [] })
        }
      })
  }

  componentWillUnmount() {
    this.mounted = false
  }

  pushNotifycation = (type, message) => {
    notification[type]({ message })
  }

  isMe = userId => {
    if (this.props.currentUser._id === userId)
      return true
    return false
  }

  actions = {
    isChecked: userId => {
      const { newGroup } = this.state

      if (!newGroup.members)
        return -1

      for (let i = 0; i < newGroup.members.length; i++) {
        let member = newGroup.members[i]
        if (member._id === userId)
          return i
      }

      return -1
    },
    handleChangeStatusModal: modalName => {
      let { openModal } = this.state
      openModal[modalName] = !openModal[modalName]

      this.setState({ openModal })
    },
    handleMakeNewGroup: async () => {
      const { newGroup, isLoading, openModal } = this.state

      isLoading.makeNewGroup = true
      this.setState({ isLoading })

      await axios.post("/api/v1/groups", newGroup)
        .then(response => {
          openModal.makeNewGroup = false
          let group = response.data.newGroup
          group.lastMessage = {
            user: this.props.currentUser,
            createdTime: Date.now(),
            type: "text",
            content: "Đã tạo nhóm"
          }
          this.pushNotifycation("success", "Thêm nhóm " + newGroup.name + " thành công")
          this.props.handleAddNewGroup(group)          
        }, error => {
          let message = "Thêm nhóm " + newGroup.name + " không thành công"
          if(error.response.data.message) {
            message = error.response.data.message
          }
          this.pushNotifycation("error", message)
        })

      isLoading.makeNewGroup = false
      this.setState({ isLoading, openModal })
    },
    getFriends: async (params = {}) => {
      message.loading("", 0)
      await axios.get("/api/v1/me/friends")
        .then(response => {
          const friends = response.data.friends
          this.actions.handleChangeStatusModal("makeNewGroup")
          this.setState({ friends })
        })
      message.destroy()
    },
    handleChangeNewGroup: (field, value, memberSelect = null) => {
      let { newGroup } = this.state
      if (field === "members") {
        if (!newGroup.members) {
          newGroup.members = [memberSelect]
        } else {
          const indexOfMember = this.actions.isChecked(value)
          if (indexOfMember !== -1) {
            newGroup.members.splice(indexOfMember, 1)
          } else {
            newGroup.members[newGroup.members.length] = memberSelect
          }
        }
      } else {
        newGroup[field] = value
      }

      this.setState({ newGroup })
    }
  }

  render() {
    const { groups } = this.props

    const { openModal, isLoading, friends, newGroup } = this.state

    return (
      <nav className="col-md-3 bg-light sidebar">
        <div className="sidebar-sticky">
          <div className="pt-3 px-4">
            <div>
              <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>Groups <i id="icon-open-modal-make-new-group" onClick={() => this.actions.getFriends()} style={{ cursor: "pointer" }} className="fa fa-plus" aria-hidden="true"></i></h2>
            </div>
            <div className="list-groups">
              <Groups currentUser={this.props.currentUser} isMe={this.isMe} groups={groups} setCurrentGroup={this.props.setCurrentGroup} />
            </div>
            <ModalMakeNewgroup
              newGroup={newGroup}
              actions={this.actions}
              visible={openModal.makeNewGroup}
              isLoading={isLoading.makeNewGroup}
              friends={friends}
            />
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
export default connect(mapStateToProps, { setCurrentGroup, initGroups, handleAddNewGroup })(SideBarLeftContainer)