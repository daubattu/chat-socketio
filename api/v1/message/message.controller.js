import Message from "../../../models/Message"
import Group from "../../../models/Group";
import path from "path"
import fs from "fs"

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

const staticFolder = path.resolve(__dirname, "../../../public/uploads")

function uploadImages(arrayImages) {
  let images = []

  for (let i = 0; i < arrayImages.length; i++) {
    const image = arrayImages[i]
    if (image.includes("base64")) {
      const data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, "")
      const mime = image.match(/^data:image\/(png|gif|jpeg);base64,/)[1]
      const timeString = new Date().getTime().toString() + i.toString()
      const name = `${timeString}.${mime}`

      images.push("/uploads/" + name)

      try {
        fs.writeFileSync(`${staticFolder}/${name}`, data, 'base64', error => {
          if (error) console.log(error)
        })
      } catch (error) { console.log(error) }
    }
  }
  return images
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

  const messages = await Message.find(query).populate("user").limit(10)
  
  return response.status(200).json({ status: 200, messages })
}

async function PostMessage(request, response) {
  const { authenticate } = request
  const props = ["groupId", "type", "content"]

  for(let prop of props) {
    if(!request.body[prop] && prop !== "content") {
      return response.status(400).json({ status: 400, messages: "Field " + prop + " is required"})
    }

    if(prop === "type") {
      if(request.body[prop] === "text") {
        if((!request.body.content || request.body.content === "")) {
          return response.status(400).json({ status: 400, message: "Tin nhắn không chứa nội dung" })
        } else if(request.body.files) {
          return response.status(400).json({ status: 400, message: "Type text không được chứa trường files" })
        }
      } else {
        if(!request.body.files) {
          return response.status(400).json({ status: 400, message: "Không tìm thấy trường files" })
        } else {
          if(!Array.isArray(request.body.files)) {
            return response.status(400).json({ status: 400, message: "Trường files phải là 1 mảng" })
          }
        }
      }
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

  if(request.body.type === "image") {
    const files = uploadImages(request.body.files)
    console.log(files)
    newMessage.files = files
  }

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