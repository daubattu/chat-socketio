import React, { Fragment } from "react"
import { Modal, Button } from "antd"
import Friends from "../Friends";

function MakeNewGroup(props) {
  const { friends, visible, isLoading, actions, newGroup } = props
  return (
    <Fragment>
      <Modal
        width="60%"
        title="Tạo nhóm"
        visible={visible}
        onCancel={() => actions.handleChangeStatusModal("makeNewGroup")}
        footer={[
          <Button key="back" onClick={() => actions.handleChangeStatusModal("makeNewGroup")}>Hủy</Button>,
          <Button key="submit" type="primary" disabled={!(newGroup.members && newGroup.members.length > 1)} loading={isLoading} onClick={actions.handleMakeNewGroup}>Tạo</Button>
        ]}>
        <div className="modal-make-new-group">
          <div className="row modal-make-new-group-head">
            <div className="col-lg-12">
              <input value={newGroup.name || ""} onChange={event => actions.handleChangeNewGroup("name", event.target.value)} className="form-control" id="name" placeholder="Tên nhóm" />
            </div>
          </div>
          <div className="row modal-make-new-group-main">
            <div className="col-lg-7 modal-make-new-group-main-friends">
              <div style={{ height: "45px" }}>
                <input className="form-control" id="search-friend" placeholder="Tìm kiếm" />
              </div>
              <div className="modal-make-new-group-main-friends-data">
                <Friends newGroup={newGroup} actions={actions} friends={friends} />
              </div>
            </div>
            <div className="col-lg-5 modal-make-new-group-main-members">
              <div style={{ height: "45px" }}>
                <b>Đã chọn <b>({newGroup.members ? newGroup.members.length : 0})</b></b>
              </div>
              <div className="modal-make-new-group-main-friends-data-selected">
                {newGroup.members && <Friends newGroup={newGroup} actions={actions} remove={true} friends={newGroup.members} />}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Fragment>
  )
}

export default MakeNewGroup