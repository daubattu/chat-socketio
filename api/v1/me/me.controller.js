import User from "../../../models/User";
import TokenNotification from "../../../models/TokenNotification";
import mongoose from "mongoose"
import Group from "../../../models/Group";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

async function GetFriends(request, response) {
  const { decoded } = request

  console.log(decoded._id)

  const props = ["online"]

  const pageOptions = {
    page: parseInt(request.query.page) * 0 === 0 ? parseInt(request.query.page) : 0,
    limit: parseInt(request.query.limit) * 0 === 0 ? parseInt(request.query.limit) : 25
  }

  let filter = {}, sort = { online: -1, latestTimeConnection: -1, name: 1 }

  for (let prop of props) {
    if (request.query[prop]) {
      if (prop === "online") {
        if (request.query.online === "true") {
          filter.online = true
        } else {
          filter.online = false
        }
      }
    }
  }

  try {
    const user = await User.findById(decoded._id)

    let friends = await User.find({ _id: { $in: user.friends } }, "username name avatar online latestTimeConnection")
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .sort(sort)
      .lean()

    for (let friend of friends) {
      friend.group = await user.getGroupChatWithFriend(friend._id)
    }

    return response.status(200).json({ status: 200, friends })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!" })
  }
}

async function Update(request, response) {
  const { decoded } = request

  try {
    const user = await User.findById(decoded._id)

    if (!user) {
      return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })
    }

    if (user.status !== 1) {
      return response.status(404).json({ status: 404, message: "Người dùng không còn hoạt động" })
    }

    if (request.body.tokenNotification) {
      console.log("NHKKKKKKKKKKKKKKKKK")
      let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)
      if (!tokenNotification) {
        return response.status(404).json({ status: 404, message: "Token notification không tồn tại" })
      }

      if (tokenNotification.user.toString() !== decoded._id.toString()) {
        return response.status(403).json({ status: 403, message: "Bạn không có quyền thay đổi thông tin user này" })
      }

      tokenNotification.value = request.body.tokenNotification

      await tokenNotification.save(error => {
        if (error) return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
      })

      console.log("tokenNotification", tokenNotification)
    }

    user.name = request.body.name
    user.username = request.body.username
    user.avatar = request.body.avatar

    await user.save()

    return response.status(200).json({ status: 200, tokenNotifications: user.tokenNotifications })
  } catch (error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  GetFriends,
  Update
}