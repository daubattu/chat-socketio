export function initFriends(friends) {
  return {
    type: "FRIENDS_INIT_FRIENDS_ALL",
    friends
  }
}

export function updateFriend(friend) {
  return {
    type: "FRIENDS_UPDATE_FRIEND",
    friend
  }
}