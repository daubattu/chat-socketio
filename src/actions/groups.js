export function initGroups(groups) {
  return {
    type: "GROUPS_INIT_GROUPS",
    groups
  }
}

export function handleAddNewGroup(group) {
  return {
    type: "GROUPS_ADD_NEW_GROUP",
    group
  }
}

export function handleUpdateGroup(group) {
  return {
    type: "GROUPS_UPDATE_GROUP",
    group
  }
}

export function handleUpdateGroupById(groupId) {
  return {
    type: "GROUPS_UPDATE_GROUP_BY_ID",
    groupId
  }
}