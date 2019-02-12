function GetNameOfPrivateGroup (userId, group) {
  if(group.members.length === 2) {
    for(let member of group.members) {
      if(member._id.toString() !== userId) {
        group.name = member.name
      }
    }
  }
  return group.name
}

export {
  GetNameOfPrivateGroup
}