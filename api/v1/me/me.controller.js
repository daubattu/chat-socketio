import User from "../../../models/User";
import TokenNotification from "../../../models/TokenNotification";

async function GetFriends(request, response) {
  const { decoded } = request

  try {
    const user = await User.findById(decoded._id).populate({ path: "friends", select: { username: 1, avatar: 1 } })

    if (!user) {
      return response.status(404).json({ status: 404, message: "Người dùng không tồn tại" })
    }

    return response.status(200).json({ status: 200, friends: user.friends })

  } catch (error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!" })
  }
}


function updatetokenNotification(user, request) {
  const { device } = request

  if (user.tokenNotifications) {
    const id = device.id
    let indexOftokenNotification = -1
    for (let i = 0; i < user.tokenNotifications.length; i++) {
      if (user.tokenNotifications[i].id === id) {
        indexOftokenNotification = i
        user.tokenNotifications[i].value = request.body.tokenNotification
        break
      }
    }

    if (indexOftokenNotification === -1) {
      user.tokenNotifications.push(
        {
          value: request.body.tokenNotification,
          device: device.name,
          id: device.id
        }
      )
    }
  } else {
    user.tokenNotifications = [
      {
        value: request.body.tokenNotification,
        device: device.name,
        id: device.id
      }
    ]
  }

  const tokenNotifications = user.tokenNotifications.filter(tokenNotification => {
    if(tokenNotification.id && tokenNotification.value && tokenNotification.device) {
      return tokenNotification
    }
  })

  return tokenNotifications
}

async function Update(request, response) {
  const { decoded } = request

  if (!device) {
    return response.status(401).json({ status: 401, message: "Không tìm thấy loại thiết bị" })
  }

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
      if(!tokenNotification) {
        return response.status(404).json({ status: 404, message: "Token notification không tồn tại" })
      }

      if(tokenNotification.user !== decoded._id) {
        return response.status(403).json({ status: 403, message: "Bạn không có quyền thay đổi thông tin user này" })
      }

      tokenNotification = request.body.tokenNotification

      await tokenNotification.save(error => {
        if(error) return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
      })
    }

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