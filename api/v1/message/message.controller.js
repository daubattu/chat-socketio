import _ from "lodash"
import Message from "../../../models/Message"
import Group from "../../../models/Group"
import TokenNotification from "../../../models/TokenNotification";
import { pushNotification } from "../../notifications"
import sizeOf from "image-size"
import path from "path"
import User from "../../../models/User";

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

function isInt(number) {
  if (parseFloat(number).toString().includes(".")) return false
  return true
}

const formatFileSize = size => {
  var i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

async function GetMessage(request, response) {
  const pageOptions = {
    page: parseInt(request.query.page) * 0 === 0 ? parseInt(request.query.page) : 0,
    limit: parseInt(request.query.limit) * 0 === 0 ? parseInt(request.query.limit) : 25
  }

  const props = ["group", "createdTime"]

  let query = {}

  for (let prop of props) {
    if (request.query[prop]) {
      if(prop === "createdTime") {
        query[prop] = { $lt: request.query[prop] }    
      } else {
        query[prop] = request.query[prop]
      }
    }
  }

  const totalOfMessages = await Message.countDocuments(query)

  const messages = await Message.find(query)
    .populate("user", "username name avatar")
    .populate("memberReaded", "username name avatar")
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({ createdTime: -1 })

  return response.status(200).json({
    status: 200,
    messages: messages.reverse(),
    numberOfPage: isInt(totalOfMessages / pageOptions.limit) ? (totalOfMessages / pageOptions.limit) : (parseInt(totalOfMessages / pageOptions.limit) + 1)
  })
}

async function PostMessage(request, response) {
  const { decoded } = request
  const props = ["groupId", "type", "content"]

  try {
    for (let prop of props) {
      if (!request.body[prop] && prop !== "content") {
        return response.status(400).json({ status: 400, messages: "Field " + prop + " is required" })
      }

      if (prop === "type") {
        if (!["text", "image", "video", "file", "voice", "map"].includes(request.body[prop])) {
          return response.status(400).json({ status: 400, message: "Hiện tại hệ thống chưa hỗ trợ kiểu tin nhắn " + request.body[prop] })
        } else {
          if (request.body[prop] === "text") {
            if ((!request.body.content || request.body.content === "")) {
              return response.status(400).json({ status: 400, message: "Tin nhắn không chứa nội dung" })
            } else if (request.body.files) {
              return response.status(400).json({ status: 400, message: "Type text không được chứa trường files" })
            }
          } else if(request.body[prop] === "map") {
            if(!request.body.lat || !request.body.lng) {
              return response.status(400).json({ status: 400, message: "Không đúng định dạng location {lat,lng}"})
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
    }

    let group = await Group.findById(request.body.groupId)
      .populate("members", "avatar name badges")
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
          select: {
            avatar: 1,
            name: 1,
            online: 1
          }
        }
      })

    if (!group) {
      return response.status(404).json({ status: 404, message: "Nhóm chát không tồn tại" })
    }

    let newMessage = new Message({
      user: decoded._id,
      group: request.body.groupId,
      createdTime: Date.now(),
      type: request.body.type,
      content: request.body.content,
      memberReaded: [decoded._id]
    })

    if(request.body.type === "map") {
      newMessage.lat = request.body.lat
      newMessage.lng = request.body.lng
    }

    if (request.body.type !== "text" && request.files) {
      let files = []
      if (!request.body.content && request.body.type === "file" && request.files.attachments[0]) {
        newMessage.content = request.files.attachments[0].originalname + " - " + formatFileSize(request.files.attachments[0].size)
      }

      const staticFolder = path.resolve(__dirname, "../../../public")

      if (request.files.attachments) {
        for (let i = 0; i < request.files.attachments.length; i++) {
          const attachment = request.files.attachments[i]
          if ((request.body.type === "image" || request.body.type === "video") && request.files.thumbnails) {
            const thumbnailSrc = request.files.thumbnails[i].filename
            const demenssions = sizeOf(staticFolder + thumbnailSrc)
            files.push({
              originalSrc: attachment.filename,
              thumbnailSrc,
              width: demenssions.width,
              height: demenssions.height
            })
          } else if (request.body.type === "voice") {
            if(!request.body.duration) {
              return response.status(400).json({ status: 400, message: "Không tìm thấy trường duration" })
            } else {
              files.push({
                originalSrc: attachment.filename,
                thumbnailSrc: null,
                width: 0,
                height: 0,
                duration: request.body.duration
              })
            }
          } else {
            files.push({
              originalSrc: attachment.filename,
              thumbnailSrc: null,
              width: 0,
              height: 0
            })
          }
        }
        newMessage.files = files
      }
    }

    await newMessage.save()

    group.lastMessage = newMessage._id
    group.updatedTime = Date.now()
    await group.save()

    const message = await Message.findById(newMessage._id)
      .populate("user", "name avatar online")
      .populate({
        path: "group",
        populate: {
          path: "lastMessage members"
        }
      })
      .populate("memberReaded", "name avatar online")
      .lean()

    const computeNameOfGroup = async (member) => {
      let groupName

      if (member._id.toString() === decoded._id.toString()) {
        for (let memberOfGroup of group.members) {
          if (member._id !== memberOfGroup._id) {
            groupName = memberOfGroup.name
          }
        }
      } else {
        const userPostMessage = await User.findById(decoded._id)
        groupName = userPostMessage.name
      }

      return groupName
    }

    for (let member of group.members) {

      if (group.members.length === 2) {
        message.group.name = await computeNameOfGroup(member)
      }

      const tokenNotifications = await TokenNotification.find({ user: member._id })

      for (let tokenNotification of tokenNotifications) {
        const sockets = tokenNotification.sockets || []

        if (sockets.length === 0) {
          // push notification to this token notification
          // check không push notification đến chính mình mắc dù chính mình thì sockets.length !== 0 rồi nhưng em vẫn check
          if (decoded._id.toString() !== member._id.toString()) {
            let messageOfNotification

            if (newMessage.type === "text") {
              messageOfNotification = newMessage.content
            } else if (newMessage.type === "image") {
              messageOfNotification = "Đã gửi " + newMessage.files.length + " bức ảnh"
            } else if (newMessage.type === "video") {
              messageOfNotification = "Đã gửi 1 video"
            } else { // Chắc chắn else là file vì đã check ở trên 
              messageOfNotification = "Đã gửi 1 file đính kèm"
            }

            if (group.members.length === 2) {
              messageOfNotification = messageOfNotification.replace("Đã gửi", "Đã gửi cho bạn")
            } else {
              messageOfNotification = message.user.name + ": " + messageOfNotification
              messageOfNotification = messageOfNotification.replace("Đã gửi", "đã gửi tới nhóm")
            }

            const titleOfNotification = "Có tin nhắn mới từ " + message.group.name
            group.name = message.group.name

            // check group này đã có nằm trong danh sách group có tin nhắn chưa đọc hay không (trường badges)
            const indexOfGroupInBadge = _.findIndex(member.badges, badge => badge.toString() === group._id.toString())

            if(indexOfGroupInBadge === -1) {
              member.badges = [...new Set(member.badges)]
              member.badges.push(group._id)
              member.markModified("badges")
              await member.save()
            }

            if(tokenNotification.value) { 
              pushNotification(tokenNotification.value, member, group, titleOfNotification, messageOfNotification).toIOS()
            }
            // console.log("Push notification to ", tokenNotification)
          }
        } else {
          for (let socket of sockets) {
            io.to(socket).emit("receiveNewMessage", message)
          }
        }
      }

      // io.sockets.to(member._id).emit("receiveNewMessage", message)
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