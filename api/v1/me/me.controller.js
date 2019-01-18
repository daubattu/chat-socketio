import User from "../../../models/User";
import TokenNotification from "../../../models/TokenNotification";
import UserFriend from "../../../models/UserFriend";
import mongoose from "mongoose"

async function GetFriends(request, response) {
  const { decoded } = request

  console.log(decoded._id)

  const props = ["online"]

  const pageOptions = {
    page: parseInt(request.query.page) * 0 === 0 ? parseInt(request.query.page) : 0,
    limit: parseInt(request.query.limit) * 0 === 0 ? parseInt(request.query.limit) : 25
  }

  let filter = {}, sort = { online: -1 }

  for(let prop of props) {
    if(request.query[prop]) {
      if(prop === "online") {
        if(request.query.online === "true") {
          filter.online = true
        } else {
          filter.online = false
        }
      }
    }
  }

  try {
    const userFriends = await UserFriend
      .aggregate(
        [
          { $match: { user: mongoose.Types.ObjectId(decoded._id) } },
          {
            $lookup: {
              from: "users",
              localField: "friend",
              foreignField: "_id",
              as: "friend"
            }
          },
          { $unwind: "$friend" },
          {
            $project: {
              _id: "$friend._id",
              username: "$frined.username",
              name: "$friend.name",
              avatar: "$friend.avatar",
              online: "$friend.online",
              latestTimeConnection: "$friend.latestTimeConnection"
            }
          },
          { $match: filter },
          { $sort: sort },
          { $skip: pageOptions.page * pageOptions.limit },
          { $limit: pageOptions.limit }
        ]
      )

    console.log(userFriends)

    // find({ user: decoded._id }).populate({ path: "friend", select: { username: 1, avatar: 1, name: 1 } })

    return response.status(200).json({ status: 200, friends: userFriends })

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
      let tokenNotification = await TokenNotification.findById(decoded.tokenNotification)
      if (!tokenNotification) {
        return response.status(404).json({ status: 404, message: "Token notification không tồn tại" })
      }

      if (tokenNotification.user !== decoded._id) {
        return response.status(403).json({ status: 403, message: "Bạn không có quyền thay đổi thông tin user này" })
      }

      tokenNotification = request.body.tokenNotification

      await tokenNotification.save(error => {
        if (error) return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
      })
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