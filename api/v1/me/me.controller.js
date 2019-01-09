import User from "../../../models/User";

async function GetFriends(request, response) {
  const { authenticate } = request

  try {
    const user = await User.findById(authenticate._id).populate({ path: "friends", select: { username: 1, avatar: 1 } })

    if(!user) {
      return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })
    }

    return response.status(200).json({ status: 200, friends: user.friends })

  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!" })
  } 
}

export {
  GetFriends
}