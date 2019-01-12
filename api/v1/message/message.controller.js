import Message from "../../../models/Message"
import Group from "../../../models/Group"

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

const formatFileSize = size => {
  var i = Math.floor( Math.log(size) / Math.log(1024) )
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

async function GetMessage(request, response) {
  const props = ["group"]

  let query = {}

  console.log("request.query.group", request.query.group)

  for (let prop of props) {
    if (request.query[prop]) {
      query[prop] = request.query[prop]
    }
  }

  const messages = await Message.find(query).populate("user").limit(10).sort({ createdTime: -1 })

  return response.status(200).json({ status: 200, messages: messages.reverse() })
}

async function PostMessage(request, response) {
  const { authenticate } = request
  const props = ["groupId", "type", "content"]

  try {
    for (let prop of props) {
      if (!request.body[prop] && prop !== "content") {
        return response.status(400).json({ status: 400, messages: "Field " + prop + " is required" })
      }

      if (prop === "type") {
        if (request.body[prop] === "text") {
          if ((!request.body.content || request.body.content === "")) {
            return response.status(400).json({ status: 400, message: "Tin nhắn không chứa nội dung" })
          } else if (request.body.files) {
            return response.status(400).json({ status: 400, message: "Type text không được chứa trường files" })
          }
        } else {
          if (!request.files) {
            return response.status(400).json({ status: 400, message: "Không tìm thấy files đính kèm" })
          } else {
            if (request.body[prop] !== "image" && request.files.length > 1) {
              return response.status(400).json({ status: 400, message: "Chỉ cho phép upload 1 file cho kiểu message này" })
            }
          }
        }
      }
    }

    const group = await Group.findById(request.body.groupId)

    if (!group) {
      return response.status(404).json({ status: 404, message: "Nhóm chát không tồn tại" })
    }

    let newMessage = new Message({
      user: authenticate._id,
      group: request.body.groupId,
      createdTime: Date.now(),
      type: request.body.type,
      content: request.body.content
    })

    if (request.body.type !== "text" && request.files) {
      let files = []
      if (!request.body.content && request.body.type !== "image" && request.files[0]) {
        newMessage.content = request.files[0].originalname + " - " + formatFileSize(request.files[0].size)
      }

      for (let attachment of request.files) {
        files.push(attachment.filename)
      }
      newMessage.files = files
    }

    await newMessage.save()

    group.lastMessage = newMessage._id
    group.updatedTime = Date.now()
    await group.save()

    const message = await Message.findById(newMessage._id)
      .populate("user")
      .populate({
        path: "group",
        populate: {
          path: "lastMessage members"
        }
      })

    for (let member of group.members) {
      io.sockets.to(member._id).emit("receiveNewMessage", message)
    }

    return response.status(200).json({ status: 200, message: newMessage })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  PostMessage,
  GetMessage
}