import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import socketIOClient from "socket.io-client"
import Chat from "../../components/Chat"
import ModalMemberOfGroup from "./Modals/MemberOfGroup"
import axios from "axios";
import { handleLogOut } from "../../actions/auth"
import { setCurrentGroup, addMembersGroup, deleteMemberOfGroup } from "../../actions/group"
import { handleUpdateGroup, handleDeleteGroupById } from "../../actions/groups"
import { Modal } from "antd"
import { updateFriend } from "../../actions/friends"
import _ from "lodash"

let socket
let timeOutClearTyping
let timeInterval

const numberOfSecondClearTyping = 8000

const confirm = Modal.confirm

class ChatContainer extends Component {
  state = {
    messages: [],
    membersTyping: [],
    messageSelected: null,
    message: {
      type: "text",
      content: null,
      files: []
    },
    openModal: {
      listMembers: false
    },
    loading: {
      addNewMember: false,
      deleteMember: false,
      loadMoreMessage: false
    },
    newMemberIds: [],
    socket: null,
    openExtendTypeMessage: false,
    deleteMemberId: null,
    page: 0,
    numberOfPage: 0
  }

  scrollToBottomOfWrapperMessages() {
    let wrapperMessages = document.getElementById("wrapper-messages")
    if (wrapperMessages) {
      wrapperMessages.scrollTop = wrapperMessages.scrollHeight
      console.log("wrapperMessages.scrollTop, wrapperMessages.scrollHeight", wrapperMessages.scrollTop, wrapperMessages.scrollHeight)
    }
  }

  async GetMessage(group, page = 0) {
    let loading = { ...this.state.loading }

    await axios.get("/api/v1/messages", {
      params: { group, page }
    }).then(response => {
      let messages = response.data.messages || []
      if (page !== 0) {
        messages = [...messages, ...this.state.messages]
        this.setState({ messages, page })
      } else {
        let numberOfPage = response.data.numberOfPage
        this.setState({ messages, numberOfPage, page })
        this.scrollToBottomOfWrapperMessages()
      }
    }, () => {
      this.setState({ messages: this.state.messages || [] })
    })

    loading.loadMoreMessage = false
    this.setState({ loading })
  }

  handleScroll = () => {
    const wrapperMessages = document.getElementById("wrapper-messages")
    const page = this.state.page + 1, numberOfPage = this.state.numberOfPage
    console.log("handleScroll", wrapperMessages)

    if (wrapperMessages.scrollTop === 0 && page < numberOfPage) {
      console.log("load more message", page)
      let loading = { ...this.state.loading }
      loading.loadMoreMessage = true
      this.setState({ loading })

      setTimeout(async () => {
        const oldHeightOfScroll = wrapperMessages.scrollHeight

        await this.GetMessage(this.props.group._id, page)

        const newHeightOfScroll = wrapperMessages.scrollHeight
        wrapperMessages.scrollTop = newHeightOfScroll - oldHeightOfScroll
      }, 1000)
    }
  }

  componentWillMount() {
    socket = socketIOClient("http://chatapp.stovietnam.com", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    })

    // socketIOClient("localhost:3000", {
    //   reconnection: true,
    //   reconnectionDelay: 1000,
    //   reconnectionDelayMax : 5000,
    //   reconnectionAttempts: Infinity
    // })

    // socketIOClient("http://chatapp.stovietnam.com")

    socket.on("newConnection", data => {
      console.log(data)
    })

    socket.on("readedLastMessage", data => {
      if (this.state.messages) {
        let messages = [...this.state.messages]

        let lastMessage = messages[messages.length - 1]

        // if ((lastMessage.user._id === this.props.currentUser._id) && (lastMessage.user._id !== data.user._id)) {
        if (lastMessage.user._id !== data.user._id) {
          if (!lastMessage.memberReaded) lastMessage.memberReaded = []

          lastMessage.memberReaded.push(data.user)

          messages[this.state.messages.length - 1] = lastMessage

          this.setState({ messages })

          this.scrollToBottomOfWrapperMessages()

          let group

          if (this.props.groups) {
            for (let groupItem of this.props.groups) {
              if (groupItem._id === lastMessage.group) {
                group = groupItem
              }
            }
          }

          if (group) {
            group.lastMessage = lastMessage
            this.props.handleUpdateGroup(group)
          }
        }
      }
    })

    socket.on("yourFriendOnline", data => {
      console.log("your friend have just connected", data)

      let groups = this.props.groups

      for (let group of groups) {
        let members = group.members
        const indexOfMember = _.findIndex(members, m => m._id === data._id)

        if (indexOfMember !== -1) {
          members[indexOfMember].online = true
          this.props.handleUpdateGroup(group, false)
        }
      }
      this.props.updateFriend({ ...data, online: true })
    })

    socket.on("yourFriendOffline", data => {
      console.log("your friend have just disconnected", data)
      let groups = this.props.groups

      for (let group of groups) {
        let members = group.members
        const indexOfMember = _.findIndex(members, m => m._id === data._id)

        if (indexOfMember !== -1) {
          members[indexOfMember].online = false
          this.props.handleUpdateGroup(group, false)
        }
      }
      this.props.updateFriend({ ...data, online: false, latestTimeConnection: Date.now() })
    })

    // Authenticate
    socket.emit('authenticate', { tokenJWT: localStorage.tokenJWT })

    // On event unauthorized
    socket.on('unauthorized', data => {
      console.log('unauthorized: ', data.message)
      if (data) {
        this.props.pushNotifycation("error", data.message)
        socket.disconnect()
        if (data.level === "error") {
          this.props.handleLogOut()
          this.props.history.replace("/auth/login")
        }
      } else {
        this.props.pushNotifycation("error", "Không có phản hồi từ server")
      }
    })

    socket.on("typing", data => {
      if (data.user._id !== this.props.currentUser._id) {
        let membersTyping

        if (data.groupId !== this.props.group._id) {
          try {
            const indexOfGroup = _.findIndex(this.props.groups, group => group._id === data.groupId)
            if (indexOfGroup !== -1) {
              if (!this.props.groups[indexOfGroup].membersTyping) {
                membersTyping = [data.user]
              } else {
                const indexOfMember = _.findIndex(this.props.groups[indexOfGroup].membersTyping, member => member._id === data.user._id)
                if (indexOfMember === -1) {
                  membersTyping = [...this.props.groups[indexOfGroup].membersTyping]
                  membersTyping.unshift(data.user)
                }
              }
              let group = { ...this.props.groups[indexOfGroup], membersTyping }
              this.props.handleUpdateGroup(group, false)
            }
          } catch (error) {
            console.log(error)
          }
        } else {
          membersTyping = [...this.state.membersTyping]
          const indexOfMember = _.findIndex(membersTyping, m => m._id === data.user._id)

          if (indexOfMember === -1) {
            membersTyping.unshift(data.user)
          }

          document.getElementById("message-content").placeholder = ""
          this.setState({ membersTyping })
        }
      }
    })

    socket.on("unTyping", data => {
      let membersTyping

      if (data.groupId !== this.props.group._id) {
        const indexOfGroup = _.findIndex(this.props.groups, group => group._id === data.groupId)
        if (indexOfGroup !== -1) {
          if (!this.props.groups[indexOfGroup].membersTyping) {
            membersTyping = []
          } else {
            const indexOfMember = _.findIndex(this.props.groups[indexOfGroup].membersTyping, member => member._id === data.user._id)
            if (indexOfMember !== -1) {
              membersTyping = [...this.props.groups[indexOfGroup].membersTyping]
              membersTyping.splice(indexOfMember, 1)
            }
          }
          let group = { ...this.props.groups[indexOfGroup], membersTyping }
          this.props.handleUpdateGroup(group, false)
        }
      } else {
        membersTyping = [...this.state.membersTyping]

        const indexOfMember = _.findIndex(membersTyping, m => m._id === data.user._id)

        if (indexOfMember !== -1) {
          membersTyping.splice(indexOfMember, 1)
          if (data.groupId !== this.props.group._id) {
            let group = { ...this.props.group, membersTyping }
            this.props.handleUpdateGroup(group, false)
          }
        }

        this.setState({ membersTyping })
      }
    })

    socket.on("receiveNewMessage", data => {
      const groupUpdate = {
        ...data.group,
        lastMessage: {
          ...data,
          user: data.user
        },
        numberOfMessagesUnReaded: 0
      }

      if (this.props.group._id === data.group._id) {
        console.log("Có tin nhắn ở group này", data.group)
        let { messages } = this.state
        messages.push(data)
        this.setState({ messages })

        // let wrapperMessages = document.getElementById("wrapper-messages")
        // if (wrapperMessages && (wrapperMessages.scrollTop === wrapperMessages.scrollHeight)) {
        this.scrollToBottomOfWrapperMessages()
        // }
        this.props.handleUpdateGroup(groupUpdate)
      } else {
        if (this.props.currentUser._id !== data.user._id) {
          let group

          if (this.props.groups) {
            for (let groupItem of this.props.groups) {
              if (groupItem._id === groupUpdate._id) {
                group = groupItem
              }
            }
          }
          // groupUpdate.name = group.name
          if (group) {
            groupUpdate.numberOfMessagesUnReaded = group.numberOfMessagesUnReaded + 1
          } else {
            groupUpdate.numberOfMessagesUnReaded = 1
          }
        }

        this.props.handleUpdateGroup(groupUpdate)
        console.log("Có tin nhắn ở group khác", data.group.name)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.group._id) {
      if (nextProps.group._id !== this.props.group._id) {
        if(nextProps.group.membersTyping) this.setState({ membersTyping: nextProps.group.membersTyping })
        this.setState({ messages: null, page: 0, numberOfPage: 0 })
        this.GetMessage(nextProps.group._id)
        socket.emit("joinRoom", { groupId: nextProps.group._id })
        // Reset numberOfMessagesUnReaded in sidebarleft become 0
        let group

        if (this.props.groups) {
          for (let groupItem of this.props.groups) {
            if (groupItem._id === nextProps.group._id) {
              group = groupItem
            }
          }
        }

        if (group && group.numberOfMessagesUnReaded !== 0) {
          group.numberOfMessagesUnReaded = 0
          this.props.handleUpdateGroup(group, false)
        }

        if (this.props.group._id) {
          this.setState({ membersTyping: [] })
          socket.emit("leaveRoom", { groupId: this.props.group._id })
        }
      }
    }
  }

  actions = {
    setMessageSelected: messageSelected => {
      this.setState({ messageSelected })
    },
    confirmDeleteMember: (deleteMember, isMe = false) => {
      let _this = this
      let { group } = this.props

      let title = `Bạn có thực sự muốn xóa người dùng ${deleteMember.name || deleteMember.username} khỏi nhóm chat ${group.name}?`

      if (isMe) {
        title = "Bạn có thực sự muốn rời nhóm chát " + group.name + " ?"
      }

      confirm({
        title,
        width: "30%",
        onOk() {
          return new Promise((resolve, reject) => {
            axios.delete(`/api/v1/groups/${group._id}/members`, {
              params: {
                deleteMemberId: deleteMember._id
              }
            }).then(response => {
              _this.props.pushNotifycation("success", `Xóa người dùng ${deleteMember.name || deleteMember.username} khỏi nhóm chat ${group.name} thành công`)
              let members = group.members

              for (let i = 0; i < members.length; i++) {
                if (members[i]._id === deleteMember._id) {
                  _this.props.deleteMemberOfGroup(members[i]._id)
                  break
                }
              }
              _this.actions.handleChangeStatusModal("listMembers")
              members = [...group.members].filter(member => member._id !== deleteMember._id)
              if (response.data.admin) {
                group = {
                  ...group,
                  admin: response.data.admin
                }
              }

              if (members.length === 0 || isMe) {
                _this.props.handleDeleteGroupById(group._id)
              } else {
                _this.props.handleUpdateGroup({ ...group, members })
              }
              resolve()
            }, error => {
              let message = `Xóa người dùng ${deleteMember.name || deleteMember.username} khỏi nhóm chat ${group.name} không thành công`

              if (error.response.data.message) {
                message = error.response.data.message
              }

              _this.props.pushNotifycation("error", message)
              reject()
            })
          })
        },
        onCancel() { },
      })
    },
    handleChangeNewMemberIds: newMemberIds => this.setState({ newMemberIds }),
    handleChangeStatusModal: modalName => {
      let { openModal, newMemberIds } = this.state

      openModal[modalName] = !openModal[modalName]

      if (modalName === "lisMembers") {
        newMemberIds = ""
      }
      this.setState({ openModal, newMemberIds })
    },
    handleChangeStateOpenExtendTypeMessage: () => {
      this.setState({ openExtendTypeMessage: !this.state.openExtendTypeMessage })
    },
    handleAddNewMembers: async () => {
      const { group } = this.props

      let { loading, newMemberIds } = this.state
      loading.addNewMember = true

      this.setState({ loading })

      await axios.post(`/api/v1/groups/${group._id}/members`, { newMemberIds: newMemberIds.split(",") })
        .then(response => {
          this.props.pushNotifycation("success", "Thêm thành viên vào nhóm " + group.name + " thành công")
          this.props.addMembersGroup(response.data.newMembers)
          this.actions.handleChangeStatusModal("listMembers")
          this.props.handleUpdateGroup({ ...group, members: [...group.members, ...response.data.newMembers] })
        }, error => {
          let message = "Thêm thành viên vào nhóm " + group.name + " không thành công"

          if (error.response.data.message) {
            message = error.response.data.message
          }

          this.props.pushNotifycation("success", message)
        })

      loading.addNewMember = false

      this.setState({ loading })
    },
    handleSendMessage: async () => {
      document.getElementById("message-content").blur()

      let message = { ...this.state.message }
      let membersTyping = [...this.state.membersTyping]

      let formData = new FormData()
      let config = { headers: { "Content-Type": "multipart/form-data" } }

      if (message.type !== "text" && message.files && message.files.length !== 0) {
        for (let attachment of message.files) {
          formData.append("attachments", attachment.file)
        }
      }

      if (message.content) {
        formData.append("content", message.content)
      }

      formData.append("groupId", this.props.group._id)
      formData.append("type", message.type)

      axios.post("/api/v1/messages", formData, config)
        .then(() => {
          message = {
            type: "text",
            content: null,
            files: null
          }
          this.scrollToBottomOfWrapperMessages()
          document.getElementById("message-content").focus()

          // xóa người này khỏi danh sách membersTyping
          const indexOfMember = _.findIndex(membersTyping, m => m._id === this.props.currentUser._id)
          if (indexOfMember !== -1) {
            membersTyping.splice(indexOfMember, 1)
          }

          this.setState({ message, membersTyping })
        }, () => {
          let { messages } = this.state
          let user = this.props.currentUser

          messages.push({ type: "text", content: "Gửi thất bại", error: true, createdTime: Date.now(), user })

          this.setState({ messages, message: { type: "text", content: null, files: null } })

          this.scrollToBottomOfWrapperMessages()
        })
    },
    handleOnTyping: () => {
      socket.emit("typing", { groupId: this.props.group._id })

      // check sau 5s thì emit event unTyping to server
      clearTimeout(timeOutClearTyping)
      timeOutClearTyping = setTimeout(() => {
        socket.emit("unTyping", { groupId: this.props.group._id })
      }, numberOfSecondClearTyping)
    },
    handleUnTyping: () => {
      socket.emit("unTyping", { groupId: this.props.group._id })
    },
    handleChangeMessage: (field, value) => {
      this.actions.handleOnTyping()
      let { message } = this.state
      message[field] = value
      if (field === "content") {
        // Nếu thay đổi nội dung tin nhắn về rỗng thì emit unTyping
        if (!value) this.actions.handleUnTyping()
        if ((!message.files || message.files.length === 0)) {
          message.type = "text"
        }
      }
      this.setState({ message })
    },
    handleDeleteFilesWithIndex: indexOfFile => {
      let message = this.state.message
      let files = [...message.files]

      files.splice(indexOfFile, 1)

      message.files = files

      if (message.files.length === 0) {
        message.files = []
        message.type = "text"
      }

      this.setState({ message })
    },
    handleChangeMessageWithFile: (typeFile, files) => {
      this.actions.handleOnTyping()
      let { message } = this.state

      if (typeFile !== "image" && files[0].size > 25 * 1024 * 1024) {
        this.props.pushNotifycation("error", "Kích thước file upload không được vượt quá 25 MB")
      } else {
        console.log(files.length)
        message.type = typeFile
        message.files = []

        const formatFileSize = size => {
          var i = Math.floor(Math.log(size) / Math.log(1024))
          return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
        }

        for (let i = 0; i < files.length; i++) {
          const reader = new FileReader()

          if (!message.files[i]) {
            message.files[i] = {}
          }

          console.log(this.state.message)

          message.files[i].file = files[i]
          message.files[i].name = files[i].name + " - " + formatFileSize(files[i].size)

          message.files[i].isLoading = true

          this.setState({ message })

          this.scrollToBottomOfWrapperMessages()

          reader.onload = event => {
            message.files[i].src = event.target.result
            message.files[i].isLoading = false
            this.setState({ message })
            this.scrollToBottomOfWrapperMessages()
          }

          reader.readAsDataURL(files[i])

          document.getElementById("message-content").focus()
        }
      }
    }
  }

  isMe = userId => {
    if (this.props.currentUser._id === userId)
      return true
    return false
  }

  isLatestMessage = messageId => {
    if (this.state.messages && (this.state.messages[this.state.messages.length - 1]._id === messageId)) {
      return true
    }

    return false
  }

  render() {
    const { group } = this.props
    const { openModal, loading, newMemberIds, messages, message, membersTyping, openExtendTypeMessage, messageSelected } = this.state

    return (
      <main role="main" className="col-md-6 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
        <Chat
          isLoadingLoadMoreMessage={loading.loadMoreMessage}
          handleScroll={this.handleScroll}
          messageSelected={messageSelected}
          isLatestMessage={this.isLatestMessage}
          message={message}
          openExtendTypeMessage={openExtendTypeMessage}
          isMe={this.isMe}
          membersTyping={membersTyping}
          group={group}
          actions={this.actions}
          messages={messages}
        />
        <ModalMemberOfGroup
          isMe={this.isMe}
          isAdmin={group.admin && this.isMe(group.admin)}
          group={group}
          actions={this.actions}
          isLoading={loading.addNewMember}
          visible={openModal.listMembers}
          newMemberIds={newMemberIds}
        />
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    groups: state.groups,
    group: state.group,
    currentUser: state.auth.user,
    auth: state.auth
  }
}

export default connect(mapStateToProps, { handleLogOut, setCurrentGroup, handleDeleteGroupById, deleteMemberOfGroup, addMembersGroup, handleUpdateGroup, updateFriend })(ChatContainer)