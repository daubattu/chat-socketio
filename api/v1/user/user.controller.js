
import User from "../../../models/User"
import UserFriend from "../../../models/UserFriend";

async function InitUser (request, response) {
  await User.deleteMany({})
  let arrayPromise = []

  for(let i = 0; i < 10; i++) {
    arrayPromise.push(
      new Promise(resolve => {
        let newUser = new User({
          username: `user${i + 1}`,
          name: `user${i + 1}`,
          email: `user${i + 1}@gmail.com`,
          password: "123456",
          avatar: "/images/user-avatar.png"
        })
        newUser.save(error => { 
          if(error) resolve(null)
          else resolve(newUser)
        })
      }) 
    )
  }

  Promise.all(arrayPromise)
    .then(users => {
      let success = 0
      for(let user of users) {
        if(user) success += 1
      }
      console.log("Init success ", success, " user")
    })
  
  return response.status(200).json({ status: 200 })
}

async function GetUser(request, response) {
  try {
    const users = await User.find({})
    await setTimeout(() => {

    }, 30000)
    return response.status(200).json({ status: 200, users })
  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

async function InitUserFriend(request, response) {
  try {
    await UserFriend.deleteMany({})
    const users = await User.find({})

    for(let user of users) {
      for(let u of users) {
        if(u._id !== user._id) {
          new UserFriend({
            user: user._id,
            friend: u._id
          }).save()
        }
      }
    }

    return response.status(200).json({ success: true })
  } catch(error) {
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  InitUser,
  GetUser,
  InitUserFriend
}