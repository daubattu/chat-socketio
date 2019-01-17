import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import socketIOClient from "socket.io-client"
import Chat from "../../components/Chat"
import ModalMemberOfGroup from "./Modals/MemberOfGroup"
import axios from "axios";
import { handleLogOut } from "../../actions/auth"
import { setCurrentGroup, addMembersGroup, deleteMemberOfGroup } from "../../actions/group"
import { handleUpdateGroup, handleUpdateGroupById } from "../../actions/groups"
import { Modal } from "antd"

let socket

const confirm = Modal.confirm

class ChatContainer extends Component {
  state = {
    messages: [],
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
      deleteMember: false
    },
    newMemberIds: [],
    socket: null,
    isTyping: false,
    openExtendTypeMessage: false,
    deleteMemberId: null
  }

  scrollToBottomOfWrapperMessages() {
    const wrapperMessages = document.getElementById("wrapper-messages")
    if (wrapperMessages) {
      wrapperMessages.scrollTop = wrapperMessages.scrollHeight
    }
  }

  async GetMessage(group) {
    this.setState({ messages: null })
    await axios.get("/api/v1/messages", {
      params: { group }
    }).then(response => {
      const messages = response.data.messages || []
      this.setState({ messages })
      this.scrollToBottomOfWrapperMessages()
    }, error => {
      this.setState({ messages: [] })
      console.log(error.response.data)
    })
  }

  componentWillMount() {
    socket = socketIOClient("http://chatapp.stovietnam.com")

    socket.on("newConnection", data => {
      console.log(data)
    })

    socket.on("readedLastMessage", data => {
      if (this.state.messages) {
        console.log("data readedLastMessage", data)

        let messages = [...this.state.messages]

        let lastMessage = messages[messages.length - 1]

        if ((lastMessage.user._id === this.props.currentUser._id) && (lastMessage.user._id !== data.user._id)) {
          if (!lastMessage.memberReaded) lastMessage.memberReaded = []

          lastMessage.memberReaded.push(data.user)

          messages[this.state.messages.length - 1] = lastMessage

          this.setState({ messages })

          console.log("lastMessage", lastMessage.user)

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
    })

    socket.on("yourFriendOffline", data => {
      console.log("your friend have just disconnected", data)
    })

    // Authenticate
    socket.emit('authenticate', { tokenJWT: localStorage.tokenJWT })
    // On event unauthorized
    socket.on('unauthorized', data => {
      console.log('Unauthorized:', data.message)
      this.props.handleLogOut()
      this.props.history.replace("/auth/login")
      this.props.pushNotifycation("error", data.message)
      socket.disconnect()
    })
    // socket.emit("joinRoom", { groupId: this.props.currentUser._id })
    socket.on("typing", data => {
      console.log(data)
      document.getElementById("message-content").placeholder = ""
      this.setState({ isTyping: true })
    })
    socket.on("unTyping", () => {
      this.setState({ isTyping: false })
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
        this.scrollToBottomOfWrapperMessages()
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
          if (group) {
            groupUpdate.numberOfMessagesUnReaded = group.numberOfMessagesUnReaded + 1
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
          this.setState({ isTyping: false })
          socket.emit("leaveRoom", { groupId: this.props.group._id })
        }
      }
    }
  }

  actions = {
    confirmDeleteMember: deleteMember => {
      let _this = this
      const { group } = this.props

      confirm({
        title: `Bạn có thực sự muốn xóa người dùng ${deleteMember.name || deleteMember.username} khỏi nhóm chat ${group.name}?`,
        width: "30%",
        onOk() {
          return new Promise((resolve, reject) => {
            axios.delete(`/api/v1/groups/${group._id}/members`, {
              params: {
                deleteMemberId: deleteMember._id
              }
            }).then(() => {
              _this.props.pushNotifycation("success", `Xóa người dùng ${deleteMember.name || deleteMember.username} khỏi nhóm chat ${group.name} thành công`)
              const members = group.members

              for (let i = 0; i < members.length; i++) {
                if (members[i]._id === deleteMember._id) {
                  _this.props.deleteMemberOfGroup(members[i]._id)
                  break
                }
              }
              _this.actions.handleChangeStatusModal("listMembers")
              _this.props.handleUpdateGroup({ ...group, members: [...group.members].filter(member => member._id !== deleteMember._id) })
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

      let formData = new FormData()
      let config = { headers: { "Content-Type": "multipart/form-data" } }

      if (message.type !== "text" && message.files) {
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
          this.setState({ message })
        }, error => {
          let { messages } = this.state
          let user = this.props.currentUser

          messages.push({ type: "text", content: "Gửi thất bại", error: true, createdTime: Date.now(), user })

          this.setState({ messages })

          this.scrollToBottomOfWrapperMessages()
          console.log(error)
        })
    },
    handleOnTyping: () => {
      socket.emit("typing", { groupId: this.props.group._id })
    },
    handleUnTyping: () => {
      socket.emit("unTyping", { groupId: this.props.group._id })
    },
    handleChangeMessage: (field, value) => {
      let { message } = this.state
      message[field] = value
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
    const { openModal, loading, newMemberIds, messages, message, isTyping, openExtendTypeMessage } = this.state

    return (
      <main role="main" className="col-md-7 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
        <Chat isLatestMessage={this.isLatestMessage} message={message} openExtendTypeMessage={openExtendTypeMessage} isMe={this.isMe} isTyping={isTyping} group={group} actions={this.actions} messages={messages} />
        <ModalMemberOfGroup
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

export default connect(mapStateToProps, { handleLogOut, setCurrentGroup, deleteMemberOfGroup, addMembersGroup, handleUpdateGroup })(ChatContainer)