import React, { Fragment } from "react"
import { Modal, Button, Icon } from "antd"

function MemberOfGroup(props) {
  const { group, visible, actions, isLoading, newMemberIds } = props

  const styleOfStatusGroup = online => { 
    return {
      width: "7px",
      position: "absolute",
      bottom: 0,
      zIndex: 1,
      transform: "translate(-50%, 50%)",
      height: "7px",
      border: "1px solid #fff",
      borderRadius: "50%",
      backgroundColor: online ? "green" : "red",
    }
  }
      
  return (
    <Modal
      title={`Thành viên nhóm ${group._id && group.name}`}
      visible={visible}
      onCancel={() => actions.handleChangeStatusModal("listMembers")}
      footer={[
        <Button key="back" onClick={() => actions.handleChangeStatusModal("listMembers")}>Trở lại</Button>,
        <Button key="submit" type="primary" loading={isLoading} onClick={actions.handleAddNewMembers}>Thêm vào nhóm</Button>
      ]}>
      {
        group._id
        &&
        <Fragment>
          {
            group.members.map((member, index) => {
              return (
                <div className="item-member-of-modal-members-group" onClick={() => actions.confirmDeleteMember(member)} key={member._id || index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                  <div>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={member.avatar} style={{ width: "30px", height: "30px", marginRight: "5px" }} />
                      <div style={ styleOfStatusGroup(member.online) }></div>
                    </div>
                    <b>{member.name}</b>
                  </div>
                  <Icon type="delete" />
                </div>
              )
            })
          }
        </Fragment>
      }
      <textarea onChange={event => actions.handleChangeNewMemberIds(event.target.value)} value={newMemberIds || ""} className="form-control" style={{ marginTop: "15px" }} />
      <small>
        Nhập _id người dùng cách nhau bởi dấu , để thêm vào nhóm hoặc tạo nhóm mới<br />
        VD: 123,321
      </small>
    </Modal>
  )
}

export default MemberOfGroup