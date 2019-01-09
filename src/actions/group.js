export function setCurrentGroup(group) {
  return {
    type: "SET_CURRENT_GROUP",
    payload: {
      group
    }
  }
}

export function addMembersGroup(members) {
  return {
    type: "ADD_MEMBERS_CURRENT_GROUP",
    members
  }
}

export function deleteMemberOfGroup(deleteMemberId) {
  return {
    type: "DELETE_MEMBER_CURRENT_GROUP",
    deleteMemberId
  }
}