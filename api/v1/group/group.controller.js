import Group from "../../../models/Group"
import User from "../../../models/User";
// import GroupUser from "../../../models/GroupUser"

function makeGroup(members, name) {
  return new Promise(async resolve => {
    let newGroup = await new Group({ members, name }).save()
    if(newGroup) resolve(newGroup)
    else resolve(null)
  })
}

async function InitGroup(request, response) {
  try {
    await Group.deleteMany({})
    const users = await User.find({})

    let arrayPromise = []

    for(let i = 0; i < users.length; i++) {
      for(let j = 0; j < users.length; j++) {
        if(j !== i) {
          arrayPromise.push(
            makeGroup([users[i]._id, users[j]._id], users[i].name + users[j].name)
          )
        }
      }
    }

    Promise.all(arrayPromise)
      .then(groups => {
        let success = 0
        for(let group of groups) {
          if(group) success += 1
        }

        console.log("Init success ", success, " group")
      })
    return response.status(200).json({ status: 200 })
  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function GetGroup(request, response) {
  const { authenticate } = request
  try {
    const groups = await Group.find({}).limit(10).populate({ path: "members", select: { username: 1, avatar: 1 } })
    return response.status(200).json({ status: 200, groups })
  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function UpdateGroup(request, response) {
  const { groupId } = request.params

  const { newMemberIds } = request.body

  if(!newMemberIds) {
    return response.status(400).json({ status: 400, message: "Không tìm thấy trường dữ liệu newMemberIds"})
  }

  try {
    const group = await Group.findById(groupId)

    if(!group) {
      return response.status(404).json({ status: 404, message: "Không tìm thấy nhóm chát" })
    }

    let members = group.members

    for(let newMemberId of newMemberIds) {
      // Kiểm tra _id người dùng hợp lệ
      const user = await User.findById(newMemberId)

      if(members.indexOf(newMemberId) === -1 && user && user.status === 1) {
        members[members.length] = newMemberId
      }
    }

    group.members = members
    group.markModified("members")

    await group.save()

    // lấy trưởng avatar, username cho member vừa add
    const groupAfterUpdate = await Group.findById(group._id).populate({ path: "members", select: { username: 1, avatar: 1 } })

    return response.status(200).json({ status: 200, group: groupAfterUpdate })
  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  GetGroup,
  InitGroup,
  UpdateGroup
}