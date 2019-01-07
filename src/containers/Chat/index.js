import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import socketIOClient from "socket.io-client"
import Chat from "../../components/Chat"
import ModalMemberOfGroup from "./Modals/MemberOfGroup"
import axios from "axios";
import { setCurrentGroup } from "../../actions/group"

let socket = socketIOClient("http://localhost:3000")

socket.on("newConnection", data => {
  console.log(data)
})

class ChatContainer extends Component {
  state = {
    messages: null,
    message: {
      type: "text",
      content: null,
      file: null
    },
    openModal: {
      listMembers: false
    },
    loading: {
      addNewMember: false
    },
    newMemberIds: [],
    socket: null,
    isTyping: false,
    openExtendTypeMessage: false
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
    socket.on("typing", () => {
      document.getElementById("message-content").placeholder = ""
      this.setState({ isTyping: true })
    })
    socket.on("unTyping", () => {
      this.setState({ isTyping: false })
    })
    socket.on("receiveNewMessage", data => {
      let { messages } = this.state
      messages.push(data)
      this.setState({ messages })
      this.scrollToBottomOfWrapperMessages()
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.group._id) {
      this.GetMessage(nextProps.group._id)
      socket.emit("joinRoom", { groupId: nextProps.group._id })

      if (this.props.group._id && (nextProps.group._id !== this.props.group._id)) {
        socket.emit("leaveRoom", { groupId: this.props.group._id })
      }
    }
  }

  actions = {
    handleChangeNewMemberIds: newMemberIds => this.setState({ newMemberIds }),
    handleChangeStatusModal: modalName => {
      let { openModal } = this.state

      openModal[modalName] = !openModal[modalName]

      this.setState({ openModal })
    },
    handleChangeStateOpenExtendTypeMessage: () => {
      this.setState({ openExtendTypeMessage: !this.state.openExtendTypeMessage })
    },
    handleAddNewMembers: async () => {
      const { group } = this.props

      let { loading, newMemberIds } = this.state
      loading.addNewMember = true

      this.setState({ loading })

      await axios.put(`/api/v1/groups/${group._id}`, { newMemberIds: newMemberIds.split(",") })
        .then(response => {
          this.props.pushNotifycation("success", "Thêm thành viên vào nhóm " + group.name + " thành công")
          this.props.setCurrentGroup(response.data.group)
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

      const messageToSend = { ...this.state.message }
      let message = {
        type: "text",
        content: null,
        file: null
      }

      this.setState({ message })

      axios.post("/api/v1/messages", {
        socketID: socket.id,
        groupId: this.props.group._id,
        ...messageToSend
      }).then(() => { },
        error => {
          let { messages } = this.state
          let user = this.props.currentUser

          messages.push({ type: "text", content: "Gửi thất bại", error: true, createdTime: Date.now(), user })

          this.setState({ messages })
          console.log(error)
        })
    },
    handleOnTyping: () => {
      socket.emit("typing")
    },
    handleUnTyping: () => {
      socket.emit("unTyping")
    },
    handleChangeMessage: (field, value) => {
      let { message } = this.state
      message[field] = value
      this.setState({ message })
    }
  }

  isMe = userId => {
    if (this.props.currentUser._id === userId)
      return true
    return false
  }

  render() {
    const { group } = this.props
    const { openModal, loading, newMemberIds, messages, message, isTyping, openExtendTypeMessage } = this.state

    return (
      <main role="main" className="col-md-7 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
        <Chat message={message} openExtendTypeMessage={openExtendTypeMessage} isMe={this.isMe} isTyping={isTyping} group={group} actions={this.actions} messages={messages} />
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
    group: state.group,
    currentUser: state.auth.user
  }
}

export default connect(mapStateToProps, { setCurrentGroup })(ChatContainer)