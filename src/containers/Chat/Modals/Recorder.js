import React, { Fragment } from "react"
import { Modal, Button, Icon } from "antd"

const customNumberTime = time => {
  if(time < 10) {
    return `0${time}`
  }
  return time
}

const customDuration = duration => {
  const seconds = duration % 60
  const minutes = parseInt(duration/60)

  return `${customNumberTime(minutes)}:${customNumberTime(seconds)}`
}

function Recorder(props) {
  const { visible, actions, isRecording, durationOfRecording } = props 
  return (
    <Modal
      // title={`Thành viên nhóm ${group._id && group.name}`}
      visible={visible}
      width="350px"
      onCancel={() => actions.handleChangeStatusModal("recordAudio")}
      footer={null}>
      <div 
        onClick={actions.handleOnClickRecording}
        // onMouseDown={actions.handleOnMouseDownRecording}
        // onMouseUp={actions.handleOnMouseUpRecording}
        className={ isRecording ? "rec-effect-1" : "" }
        style={{ 
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          width: "37px",
          height: "37px",
          color: "#fff",
          background: "#000",
          fontSize: "1.1em",
          lineHeight: "37px",
          textAlign: "center",
          borderRadius: "50% 50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        { 
          isRecording 
          ? <small style={{ fontWeight: "bold", fontSize: "65%" }}>{customDuration(durationOfRecording)}</small>
          : <i className="fa fa-microphone"></i>
        }
      </div>
      <canvas id="spectrum" width="280" height={ isRecording ? "100" : 0 } style={{ display: "block", margin: "10px auto 0 auto" }}></canvas>
      {/* <audio id="previewVoiceAudio" controls></audio> */}
    </Modal>
  )
}

export default Recorder