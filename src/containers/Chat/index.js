import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import socketIOClient from "socket.io-client"
import Chat from "../../components/Chat"
import ModalMemberOfGroup from "./Modals/MemberOfGroup"
import axios from "axios";
import { handleLogOut } from "../../actions/auth"
import { setCurrentGroup, addMembersGroup, deleteMemberOfGroup } from "../../actions/group"
import { handleUpdateGroup, handleDeleteGroupById } from "../../actions/groups"
import { Modal, message } from "antd"
import { updateFriend } from "../../actions/friends"
import _ from "lodash"
import Recorder from "./Modals/Recorder"

let socket
let timeOutClearTyping
let timeIntervalRecording

// variable for record
let recorder, chunks

const numberOfSecondClearTyping = 8000

const confirm = Modal.confirm

const resizeImage = async (dataUrl, fileName, MAX_WIDTH = 480, MAX_HEIGHT = 360) => {
  let img = document.createElement("img");
  img.src = dataUrl

  function getWidthHeightOfImage(img) {
    return new Promise(resolve => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
    })
  }

  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");

  let { width, height } = await getWidthHeightOfImage(img)

  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
      height = MAX_HEIGHT;
    }
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(img, 0, 0, width, height);

  let dataUrlThumbnail = canvas.toDataURL("image/jpeg");

  function dataURLtoFile(base64) {
    var arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName + ".jpg", { type: mime });
  }

  return dataURLtoFile(dataUrlThumbnail)
}

class ChatContainer extends Component {
  state = {
    messages: [],
    membersTyping: [],
    message: {
      type: "text",
      content: null,
      files: []
    },
    openModal: {
      listMembers: false,
      recordAudio: false
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
    numberOfPage: 0,
    isTyping: false,
    percentCompleted: 0,
    isRecording: false,
    durationOfRecording: 0,
    isClicking: false,
    recordedData: [],
    refMessage: null
  }

  scrollToBottomOfWrapperMessages() {
    let wrapperMessages = document.getElementById("wrapper-messages")
    if (wrapperMessages) {
      console.log("scrollToBottomOfWrapperMessages")
      wrapperMessages.scrollTop = wrapperMessages.scrollHeight
    }
  }

  async GetMessage(group, page = 0) {
    let loading = { ...this.state.loading }
    let params = { group, page }

    if (page) {
      params.createdTime = this.state.messages[this.state.messages.length - 1].createdTime
    }

    await axios.get("/api/v1/messages", { params }).then(response => {
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

    if (wrapperMessages.scrollTop === 0 && page < numberOfPage) {
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

        let lastMessage = { ...messages[messages.length - 1] }
        let memberReaded = [...lastMessage.memberReaded]

        if (lastMessage.user._id !== data.user._id) {
          if (!lastMessage.memberReaded) lastMessage.memberReaded = []

          lastMessage.memberReaded.push(data.user)
          memberReaded.push(data.user._id)
          messages[this.state.messages.length - 1] = lastMessage

          this.setState({ messages })

          this.scrollToBottomOfWrapperMessages()

          let group

          if (this.props.groups) {
            for (let groupItem of this.props.groups) {
              if (groupItem._id === lastMessage.group._id) {
                group = groupItem
              }
            }
          }

          if (group) {
            group.lastMessage = {
              ...group.lastMessage,
              memberReaded
            }
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

      let indexOfMember
      for (let group of groups) {
        let members = group.members
        indexOfMember = _.findIndex(members, m => m._id === data._id)

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
      console.log("someone is typing", data)
      if (data.user._id !== this.props.currentUser._id) {
        let membersTyping

        if (data.groupId !== this.props.group._id) {
          try {
            const indexOfGroup = _.findIndex(this.props.groups, group => group._id === data.groupId)
            if (indexOfGroup !== -1) {

              if (this.props.groups[indexOfGroup].membersTyping) {
                membersTyping = [...this.props.groups[indexOfGroup].membersTyping]
              } else {
                membersTyping = []
              }

              const indexOfMember = _.findIndex(this.props.groups[indexOfGroup].membersTyping, member => member._id === data.user._id)

              if (indexOfMember === -1) {
                membersTyping.unshift(data.user)
              }

              let group = { ...this.props.groups[indexOfGroup], membersTyping }
              this.props.handleUpdateGroup(group, false)
            }
          } catch (error) {
            console.log("catch socket on typing", error)
          }
        } else {
          membersTyping = [...this.state.membersTyping]
          const indexOfMember = _.findIndex(membersTyping, m => m._id === data.user._id)

          if (indexOfMember === -1) {
            membersTyping.unshift(data.user)
          }

          document.getElementById("message-content").placeholder = ""
          this.setState({ membersTyping })
          if (membersTyping.length === 1) {
            this.scrollToBottomOfWrapperMessages()
          }
        }
      }
    })

    socket.on("unTyping", data => {
      let membersTyping
      if (data.groupId !== this.props.group._id) {
        const indexOfGroup = _.findIndex(this.props.groups, group => group._id === data.groupId)
        if (indexOfGroup !== -1) {
          if (this.props.groups[indexOfGroup].membersTyping) {
            membersTyping = [...this.props.groups[indexOfGroup].membersTyping]
            const indexOfMember = _.findIndex(this.props.groups[indexOfGroup].membersTyping, member => member._id === data.user._id)

            if (indexOfMember !== -1) {
              membersTyping.splice(indexOfMember, 1)
              let group = { ...this.props.groups[indexOfGroup], membersTyping }
              this.props.handleUpdateGroup(group, false)
            }
          }
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

        if (membersTyping.length === 0) {
          this.scrollToBottomOfWrapperMessages()
        }
      }
    })

    socket.on("receiveNewMessage", data => {
      const groupUpdate = {
        ...data.group,
        lastMessage: {
          ...data,
          user: data.user,
          memberReaded: []
        },
        numberOfMessagesUnReaded: 0
      }

      if (this.props.group._id === data.group._id) {
        let { messages } = this.state
        messages.push(data)
        this.setState({ messages })

        // let wrapperMessages = document.getElementById("wrapper-messages")
        // if (wrapperMessages && (wrapperMessages.scrollTop === wrapperMessages.scrollHeight)) {
        this.scrollToBottomOfWrapperMessages()
        // }
        this.props.handleUpdateGroup(groupUpdate)
        this.props.setCurrentGroup(groupUpdate)
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

        // this.props.setCurrentGroup(groupUpdate)
        this.props.handleUpdateGroup(groupUpdate)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.group._id) {
      if (nextProps.group._id !== this.props.group._id) {
        if (nextProps.group.membersTyping) this.setState({ membersTyping: nextProps.group.membersTyping })
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
          // reset message from last group
          let message = {
            type: "text",
            content: null,
            files: []
          }
          this.setState({ membersTyping: [], message })
          socket.emit("leaveRoom", { groupId: this.props.group._id })
          let audios = document.getElementsByTagName("audio")

          for(let audio of audios) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      }
    }
  }

  actions = {
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
                const indexOfGroup = _.findIndex(_this.props.groups, g => g._id === group._id)

                if (indexOfGroup !== -1) {
                  _this.props.handleUpdateGroup({ ...group, members })
                }
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
      let { openModal, newMemberIds, isRecording } = this.state

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

      if(this.state.refMessage) {
        formData.append("ref", this.state.refMessage._id)
      }

      if (message.type !== "text" && message.files && message.files.length !== 0) {
        let originFile, thumbnailFile

        for (let attachment of message.files) {
          if (message.type === "image") {
            originFile = await resizeImage(attachment.src, attachment.file.name, 1280, 720)
            formData.append("attachments", originFile)
          } else {
            formData.append("attachments", attachment.file)
          }

          if (message.type === "video" || message.type === "image") {
            thumbnailFile = await resizeImage(attachment.src, attachment.file.name, 480, 360)
            formData.append("thumbnails", thumbnailFile)
          }

          if (message.type === "voice" && attachment.duration) {
            formData.append("duration", attachment.duration)
          }
        }
      }

      if (message.content) {
        formData.append("content", message.content)
      }

      formData.append("groupId", this.props.group._id)
      formData.append("type", message.type)

      config.onUploadProgress = progressEvent => {
        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total)
        this.setState({ percentCompleted })
        console.log("percentCompleted", percentCompleted)
        // do whatever you like with the percentage complete
        // maybe dispatch an action that will update a progress bar or something
      }

      axios.post("/api/v1/messages", formData, config)
        .then(() => {
          this.setState({ percentCompleted: 0 })
          message = {
            type: "text",
            content: null,
            files: []
          }
          this.scrollToBottomOfWrapperMessages()
          document.getElementById("message-content").focus()
          if (document.querySelector("input[type='file']")) {
            document.querySelector("input[type='file']").value = ""
          }

          // xóa người này khỏi danh sách membersTyping
          const indexOfMember = _.findIndex(membersTyping, m => m._id === this.props.currentUser._id)
          if (indexOfMember !== -1) {
            membersTyping.splice(indexOfMember, 1)

            const indexOfGroup = _.findIndex(this.props.groups, group => group._id === this.props.group._id)

            if (indexOfGroup !== -1) {
              let group = { ...this.props.group, membersTyping }
              this.props.handleUpdateGroup(group, false)
            }
          }
          this.setState({ message, membersTyping, openExtendTypeMessage: false, refMessage: null })
        }, () => {
          this.setState({ percentCompleted: 0 })
          let { messages } = this.state
          let user = this.props.currentUser

          messages.push({ type: "text", content: "Gửi thất bại", error: true, createdTime: Date.now(), user })
          document.querySelector("input[type='file']").value = ""

          this.setState({ messages, message: { type: "text", content: null, files: [] } })

          this.scrollToBottomOfWrapperMessages()
        })
    },
    handleReadLastMessage: () => {
      const lastMessage = { ...this.state.messages[this.state.messages.length - 1] }

      const indexOfMemberReaded = _.findIndex(lastMessage.memberReaded, m => m._id === this.props.currentUser._id || m === this.props.currentUser._id)

      if (indexOfMemberReaded === -1) {
        socket.emit("readLastMessage", { groupId: this.props.group._id })
      }
    },
    handleOnTyping: () => {
      if (!this.state.isTyping) {
        this.setState({ isTyping: true })
        socket.emit("typing", { groupId: this.props.group._id })
      }

      // check sau 5s thì emit event unTyping to server
      clearTimeout(timeOutClearTyping)
      timeOutClearTyping = setTimeout(() => {
        this.actions.handleUnTyping() //call function emit unTyping
      }, numberOfSecondClearTyping)
    },
    handleUnTyping: () => {
      if (this.state.isTyping) {
        this.setState({ isTyping: false })
        socket.emit("unTyping", { groupId: this.props.group._id })
      }
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

      if(field === "type" && value !== "text" && message.files.length !== 0) {
        message.files = []
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
      console.log(files)
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

          message.files[i].file = files[i]
          message.files[i].name = files[i].name + " - " + formatFileSize(files[i].size)

          message.files[i].isLoading = true

          this.setState({ message })

          this.scrollToBottomOfWrapperMessages()

          reader.onload = event => {
            // message.files[i].thumbnail = resizeImage(event.target.result, files[i].name)
            if (typeFile === "video") {
              const video = document.createElement("video")
              video.src = event.target.result
              if (video.duration > 5) {
                video.currentTime = 2
              }

              const canvas = document.createElement("canvas")
              const context = canvas.getContext('2d')
              video.addEventListener("loadeddata", () => {
                const ratio = video.videoWidth / video.videoHeight;
                // Define the required width as 100 pixels smaller than the actual video's width
                const width = video.videoWidth - 100
                // Calculate the height based on the video's width and the ratio
                const height = parseInt(width / ratio, 10)
                // Set the canvas width and height to the values just calculated
                canvas.width = width;
                canvas.height = height;

                console.log("width, height", width, height)
                context.drawImage(video, 0, 0, width, height)
                message.files[i].src = canvas.toDataURL("image/jpeg")
                message.files[i].isLoading = false
                this.setState({ message })
              })
            } else {
              message.files[i].src = event.target.result
              message.files[i].isLoading = false
              this.setState({ message })
            }
            this.scrollToBottomOfWrapperMessages()
          }

          reader.readAsDataURL(files[i])

          document.getElementById("message-content").focus()
        }
      }
    },
    changeStatusRecording: () => {
      let { isRecording } = this.state
      this.setState({ isRecording: !isRecording })
      if (!isRecording) {
        let { durationOfRecording } = this.state

        timeIntervalRecording = setInterval(() => {
          durationOfRecording += 1
          this.setState({ durationOfRecording })
        }, 1000)
      }
    },
    handleOnClickRecording: () => {
      if (!this.state.isRecording) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(stream => {
            this.startRecording(stream)
            this.actions.changeStatusRecording()
          })
          .catch(error => {
            console.log(error)
            message.error("Bạn phải cấp quyền sử dụng microphone để thực hiện chức năng này", 3)
          });
      } else {
        this.actions.changeStatusRecording()
        clearInterval(timeIntervalRecording)
        this.setState({ durationOfRecording: 0 })
        this.endRecording()
      }
    },
    setRefMessage: message => {
      this.setState({ refMessage: message })
      document.getElementById("message-content").focus()
    }
  }

  startRecording(stream) {
    this.visualize(stream)
    window.localStream = stream
    chunks = [];
    // create media recorder instance to initialize recording
    recorder = new MediaRecorder(stream, { audioBitsPerSecond : 8000 });
    
    // function to be called when data is received
    recorder.ondataavailable = e => {
      // add stream data to chunks
      chunks.push(e.data);
    };
    // start recording with 1 second time between receiving 'ondataavailable' events
    recorder.start(1000);
  }

  endRecording() {
    let message = { ...this.state.message }
    this.actions.handleChangeStatusModal("recordAudio")
    const tracks = window.localStream.getTracks() || []

    for(let track of tracks) {
      track.stop()
    }

    recorder.stop()
    
    let blob = new Blob(chunks, { type: 'audio/m4a' });
    blob.lastModifiedDate = new Date();
    blob.name = "record.m4a"
    
    let file = message.files[0] || {}

      file.file = new File([blob], blob.name)
      file.duration = this.state.durationOfRecording
      file.isLoading = true
  
      message.files[0] = file
      this.setState({ message })
  
      let audio = document.createElement("audio")
      audio.src = URL.createObjectURL(blob)
      audio.preload = "metadata"
      audio.controls = true

      audio.addEventListener("loadedmetadata", async () => {
        // console.log("audio.duration", audio.duration)
        file.src = URL.createObjectURL(blob)
        file.isLoading = false
        message.files[0] = file
        this.setState({ message })
        this.scrollToBottomOfWrapperMessages()
        document.getElementById("message-content").focus()
      })
  }

  visualize = (stream) => {
    var canvas = document.getElementById("spectrum")
    if (!canvas) return;

    let audioCtx = new AudioContext()

    var canvasCtx = canvas.getContext("2d");
    var source = audioCtx.createMediaStreamSource(stream);

    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    const draw = () => {
      // get the canvas dimensions
      var width = canvas.width,
        height = canvas.height;

      // ask the browser to schedule a redraw before the next repaint
      requestAnimationFrame(draw);

      // clear the canvas
      canvasCtx.fillStyle = "#fff";
      canvasCtx.fillRect(0, 0, width, height);

      if (!this.state.isRecording) return;

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#333";

      canvasCtx.beginPath();

      var sliceWidth = width * 1.0 / bufferLength;
      var x = 0;

      analyser.getByteTimeDomainData(dataArray);

      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * height / 2;

        i == 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }

    draw();
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

  isPrivateGroup = () => {
    if(this.props.group.admin) {
      return false
    }
    return true
  }

  render() {
    const { group } = this.props
    const { openModal, refMessage, isRecording, durationOfRecording, loading, newMemberIds, messages, message, membersTyping, openExtendTypeMessage, percentCompleted } = this.state

    return (
      <main role="main" className="col-md-6 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
        <Chat
          refMessage={refMessage}
          isLoadingLoadMoreMessage={loading.loadMoreMessage}
          handleScroll={this.handleScroll}
          isLatestMessage={this.isLatestMessage}
          message={message}
          openExtendTypeMessage={openExtendTypeMessage}
          isMe={this.isMe}
          membersTyping={membersTyping}
          group={group}
          actions={this.actions}
          messages={messages}
          percentCompleted={percentCompleted}
          isPrivateGroup={this.isPrivateGroup()}
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
        <Recorder actions={this.actions} visible={openModal.recordAudio} isRecording={isRecording} durationOfRecording={durationOfRecording} />
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