import React, { Component, Fragment } from "react"
import { connect } from "react-redux"
import Chat from "../components/Chat"
import { Button, Modal } from "antd"
import axios from "axios";
import { setCurrentGroup } from "../actions/group"

class ChatContainer extends Component {
  state = {
    messages: null,
    openModal: {
      listMembers: false
    },
    loading: {
      addNewMember: false
    },
    newMemberIds: []
  }

  actions = {
    changeStatusModal: modalName => {
      let { openModal } = this.state

      openModal[modalName] = !openModal[modalName]

      this.setState({ openModal })
    },
    handleAddNewMembers: async () => {
      const { group } = this.props

      let { loading, newMemberIds } = this.state
      loading.addNewMember = true

      this.setState({ loading })

      await axios.put(`/api/v1/groups/${group._id}`, { newMemberIds: newMemberIds.split(",")})
        .then(response => {
          this.props.pushNotifycation("success", "Thêm thành viên vào nhóm " + group.name + " thành công")
          this.props.setCurrentGroup(response.data.group)
        }, error => {
          let message = "Thêm thành viên vào nhóm " + group.name + " không thành công"

          if(error.response.data.message) {
            message = error.response.data.message
          }

          this.props.pushNotifycation("success", message)
        })

      loading.addNewMember = false

      this.setState({ loading })
    }
  }
  render() {
    const { group } = this.props
    const { openModal, loading, newMemberIds } = this.state

    return (
      <main role="main" className="col-md-7 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
        <Chat group={group} actions={this.actions} />
        <Modal
          title={`Thành viên nhóm ${group._id && group.name}`}
          visible={openModal.listMembers}
          onCancel={() => this.actions.changeStatusModal("listMembers")}
          footer={[
            <Button key="back" onClick={() => this.actions.changeStatusModal("listMembers")}>Trở lại</Button>,
            <Button key="submit" type="primary" loading={loading.addNewMember} onClick={this.actions.handleAddNewMembers}>
              Thêm vào nhóm
            </Button>
          ]}
        >
          {
            group._id
            &&
            <Fragment>
              {
                group.members.map((member, index) => {
                  return (
                    <div key={member._id || index} style={{ display: "flex", marginBottom: "5px" }}>
                      <img src={member.avatar} style={{ width: "30px", height: "30px", marginRight: "5px" }} />
                      <b>{member.username}</b>
                    </div>
                  )
                })
              }
            </Fragment>
          }
          <textarea onChange={event => this.setState({ newMemberIds: event.target.value })} value={newMemberIds || ""} className="form-control" style={{ marginTop: "15px" }} />
          <small>
            Nhập _id người dùng cách nhau bởi dấu , để thêm vào nhóm hoặc tạo nhóm mới
            <br />
            VD: 123,321
          </small>
        </Modal>
      </main>
    )
  }
}

function mapStateToProps(state) {
  return {
    group: state.group
  }
}

export default connect(mapStateToProps, {setCurrentGroup})(ChatContainer)