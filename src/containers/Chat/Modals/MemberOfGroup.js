import React, { Fragment } from "react"
import { Modal, Button } from "antd"

function MemberOfGroup(props) {
  const { group, visible, actions, isLoading, newMemberIds } = props

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
                <div key={member._id || index} style={{ display: "flex", marginBottom: "5px" }}>
                  <img src={member.avatar} style={{ width: "30px", height: "30px", marginRight: "5px" }} />
                  <b>{member.username}</b>
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