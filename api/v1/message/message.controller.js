import Message from "../../../models/Message"
import Group from "../../../models/Group";

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

async function GetMessage(request, response) {
  const props = ["group"]

  let query = {}
  
  console.log("request.query.group", request.query.group)

  for(let prop of props) {
    if(request.query[prop]) {
      query[prop] = request.query[prop]
    }
  }


  const messages = await Message.find(query).populate("user")
  
  return response.status(200).json({ status: 200, messages })
}

async function PostMessage(request, response) {
  const { authenticate } = request
  const props = ["groupId", "type", "content"]

  for(let prop of props) {
    if(!request.body[prop]) {
      return response.status(400).json({ status: 400, messages: "Field " + prop + " is required"})
    }
  }

  const group = await Group.findById(request.body.groupId)

  if(!group) {
    return response.status(404).json({ status: 404, message: "Nhóm chát không tồn tại" })
  }

  let newMessage = new Message({
    user: authenticate._id,
    group: request.body.groupId,
    createdTime: Date.now(),
    type: request.body.type,
    content: request.body.content
  })

  await newMessage.save()
  
  group.lastMessage = newMessage._id
  await group.save()

  const message = await Message.findById(newMessage._id).populate("user")
  
  io.sockets.to(request.body.groupId).emit("receiveNewMessage", message)

  return response.status(200).json({ status: 200, message: newMessage })
}

export {
  PostMessage,
  GetMessage
}