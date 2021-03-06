import Group from "../../../models/Group"

function GetNameOfPrivateGroup (userId, group) {
  if(group.members.length === 2 && !group.admin) {
    for(let member of group.members) {
      if(member._id.toString() !== userId) {
        group.name = member.name
      }
    }
  }
  return group.name
}

async function ExistGroup(members) {
  const group = await Group.findOne({
    $and: [
      {
        members: { $all: members }
      },
      { members: { $size: members.length } },
      // { admin: { $exists: false } }
    ]
  })
  .populate("members", "username name avatar online")
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
  .populate({
    path: "lastMessage",
    populate: {
      path: "memberReaded",
      select: {
        avatar: 1,
        name: 1,
        online: 1
      }
    }
  })
  .lean()

  if(group) {
    return group
  }
  return null
}

export {
  GetNameOfPrivateGroup,
  ExistGroup
}