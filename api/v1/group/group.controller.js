import Group from "../../../models/Group"
import User from "../../../models/User";
import Message from "../../../models/Message";
// import GroupUser from "../../../models/GroupUser"
import { GetNameOfPrivateGroup, ExistGroup } from "./group.utils"

function MakeGroup(members, name) {
  return new Promise(async resolve => {
    let newGroup = await new Group({ members, name }).save()
    if (newGroup) resolve(newGroup)
    else resolve(null)
  })
}

async function InitGroup(request, response) {
  try {
    await Group.deleteMany({})
    const users = await User.find({}).sort({ name: 1 })

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        MakeGroup([users[i]._id, users[j]._id], `Room ${users[i].name.substring(4)}${users[j].name.substring(4)}`)
      }
    }

    return response.status(200).json({ status: 200 })
  } catch (error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function GetGroup(request, response) {
  const { decoded } = request

  try {
    const groups = await Group.find({ members: decoded._id, lastMessage: { $exists: true } })
      .limit(10)
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
          select: {
            username: 1,
            avatar: 1,
            name: 1
          }
        }
      })
      .populate({
        path: "members",
        select: {
          username: 1,
          avatar: 1,
          name: 1,
          online: 1
        }
      })
      .sort({ updatedTime: -1 })
      .lean()

    for (let group of groups) {
      group.name = GetNameOfPrivateGroup(decoded._id, group)
      group.numberOfMessagesUnReaded = await Message.count({ group: group._id, user: { $ne: decoded._id }, memberReaded: { $ne: decoded._id } })
    }

    return response.status(200).json({ status: 200, groups })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function UpdateGroup(request, response) {
  const { groupId } = request.params

  const { name } = request.body

  if (!name) {
    return response.status(400).json({ status: 400, message: "Không tìm thấy trường name" })
  }

  try {
    let group = await Group.findById(groupId)
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
          select: {
            username: 1,
            avatar: 1
          }
        }
      })
      .populate({
        path: "members",
        select: {
          username: 1,
          avatar: 1
        }
      })

    if (!group) {
      return response.status(404).json({ status: 404, message: "Không tìm thấy nhóm chát" })
    }

    group.name = name

    await group.save()

    return response.status(200).json({ status: 200, group })
  } catch (error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function CreateGroup(request, response) {
  const { decoded } = request

  if (!request.body.members) {
    return response.status(400).json({ status: 400, message: "Không tìm thấy trường members" })
  }

  if (!Array.isArray(request.body.members)) {
    return response.status(400).json({ status: 400, message: "Trường members phải là array" })
  }

  let members = [decoded._id]
  let membersInValid = []

  for(let member of request.body.members) {
    if(members.indexOf(member) === -1) {
      const isValidMember = await User.findById(member)
      if(isValidMember) {
        members.push(member)
      } else {
        membersInValid.push(member)
      }
    }
  }

  if(membersInValid.length !== 0) {
    let stringIdInValid = ""
    for(let memberInValid of membersInValid) {
      stringIdInValid += stringIdInValid === "" ? memberInValid : `, ${memberInValid}`
    }

    return response.status(400).json({ status: 400, message: `ID người dùng ${ stringIdInValid } không hợp lệ` })
  }

  if(members.length === 1) {
    return response.status(400).json({ status: 400, message: "Chưa chọn người tham gia chat" })
  }

  request.body.members = members

  try {
    const existGroup = await ExistGroup(request.body.members)

    console.log(request.body.members)
    
    if (existGroup) {
      console.log("Đã tồn tại")
      return response.status(200).json({ status: 200, newGroup: existGroup, isExist: true })
    } else {
      console.log("Chưa tồn tại")
      if(!request.body.name) {
        request.body.name = "Nhóm tạo bởi " + decoded.name
      }

      let newGroup = new Group(request.body)

      await newGroup.save()

      const newMessage = new Message({
        user: decoded._id,
        group: newGroup._id,
        content: "Đã tạo nhóm",
        type: "text"
      })

      await newMessage.save()

      newGroup.lastMessage = newMessage._id
      await newGroup.save()

      const newGroupAfterSave = await Group.findById(newGroup._id)
      .populate("members", "username name avatar online")
      .populate("lastMessage")
      .lean()

      if(newGroupAfterSave.members.length === 2) {
        for(let member of newGroupAfterSave.members) {
          if(member._id.toString() !== decoded._id) {
            newGroupAfterSave.name = member.name
          }
        }
      }

      return response.status(200).json({ status: 200, newGroup: newGroupAfterSave, isExist: false })
    }
  } catch (error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

function GroupMember() {
  return {
    get: async (request, response) => {
      const { groupId } = request.params

      const group = await Group.findById(groupId).populate("members", "username avatar name")

      return response.status(200).json({ status: 200, members: group.members })
    },
    post: async (request, response) => {
      const { groupId } = request.params
      const { newMemberIds } = request.body

      if (!newMemberIds) {
        return response.status(400).json({ status: 400, message: "Không tìm thấy trường newMemberIds" })
      }

      if (!newMemberIds[0]) {
        return response.status(400).json({ status: 400, message: "Kiểu dữ liệu của trường newMemberIds phải là mảng" })
      }

      try {
        let group = await Group.findById(groupId)

        if (!group) {
          return response.status(404).json({ status: 404, message: "Nhóm chat không tồn tại" })
        }

        let members = group.members
        let newMembersValid = [], newMembersInValid = []

        for (let newMemberId of newMemberIds) {
          // Kiểm tra _id người dùng hợp lệ
          const user = await User.find({ _id: newMemberId, status: 1 })

          if (!user) {
            newMembersInValid.push({
              _id: newMemberId,
              message: "Những người dùng bạn thêm không còn hoạt động hoặc không tồn tại"
            })
          } else if (members.indexOf(newMemberId) !== -1) {
            newMembersInValid.push({
              _id: newMemberId,
              message: "Người dùng đã có trong nhóm"
            })
          } else {
            members[members.length] = newMemberId
            newMembersValid[newMembersValid.length] = newMemberId
          }
        }

        if (newMembersInValid.length !== 0 && newMembersValid.length === 0) {
          return response.status(400).json({ status: 400, message: "Tất cả người dùng bạn vừa thêm không hợp lệ", newMembersInValid })
        } else {
          group.members = members
          group.markModified("members")

          group.updatedTime = Date.now()
          group.save()

          // lấy trưởng avatar, username, name cho member vừa add
          const newMembers = await User.find({ _id: { $in: newMembersValid } }, "username avatar name online")

          if (newMembersInValid.length !== 0) {
            return response.status(200).json({ status: 200, message: "Thêm thành công " + newMembersValid.length + "/" + newMemberIds.length, newMembers, newMembersInValid })
          } else {
            return response.status(200).json({ status: 200, message: "Thêm thành công người dùng vào nhóm thành công", newMembers })
          }
        }
      } catch (error) {
        console.log(error)
        return response.status(500).json({ status: 500, message: "Oops! Something wrong", error })
      }
    },
    delete: async (request, response) => {
      const { groupId } = request.params
      const { deleteMemberId } = request.query

      if (!deleteMemberId) {
        return response.status(400).json({ status: 400, message: "Không tìm thấy trường deleteMemberId" })
      }

      const user = await User.findById(deleteMemberId)

      if (!user) {
        return response.status(404).json({ status: 400, message: "Người dùng cần xóa khỏi group không tồn tại" })
      }

      try {
        let group = await Group.findById(groupId)

        if (!group) {
          return response.status(404).json({ status: 404, message: "Nhóm chat không tồn tại" })
        }

        let members = group.members, indexOfMemberDelete = -1

        for (let i = 0; i < members.length; i++) {
          let member = members[i]
          if (member.toString() === deleteMemberId) {
            indexOfMemberDelete = i
            break
          }
        }

        if (indexOfMemberDelete === -1) {
          return response.status(404).json({ status: 404, message: "Người dùng cần xóa ngoài nhóm chat" })
        }

        members.splice(indexOfMemberDelete, 1)

        group.members = members
        group.markModified("group")
        group.updatedTime = Date.now()
        group.save()

        return response.status(200).json({ status: 200 })
      } catch (error) {
        console.log(error)
        return response.status(500).json({ status: 500, message: "Oops! Something wrong", error })
      }
    }
  }
}

export {
  GetGroup,
  InitGroup,
  UpdateGroup,
  CreateGroup,
  GroupMember,
  MakeGroup
}