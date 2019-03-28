
import User from "../../../models/User"

const users = [
  {
    username: "user1",
    name: "Kim Thanh Tùng",
    email: "user1@gmail.com",
    password: "123456",
    avatar: "/images/user1.jpg"
  },
  {
    username: "user2",
    name: "Hoàng Đức Toàn",
    email: "user2@gmail.com",
    password: "123456",
    avatar: "/images/user2.jpg"
  },
  {
    username: "user3",
    name: "Bùi Văn Nhiêm",
    email: "user3@gmail.com",
    password: "123456",
    avatar: "/images/user3.jpg"
  },
  {
    username: "user4",
    name: "Trần Văn Kiên",
    email: "user4@gmail.com",
    password: "123456",
    avatar: "/images/user4.jpg"
  },
  {
    username: "user5",
    name: "Trần Trung Dũng",
    email: "user5@gmail.com",
    password: "123456",
    avatar: "/images/user5.jpg"
  },
  {
    username: "user6",
    name: "Phạm Khánh Hòa",
    email: "user6@gmail.com",
    password: "123456",
    avatar: "/images/user6.jpg"
  },
  {
    username: "user7",
    name: "Nguyễn Hưng Khánh",
    email: "user7@gmail.com",
    password: "123456",
    avatar: "/images/user7.jpg"
  },
  {
    username: "user8",
    name: "Bùi Thị Thanh Hương",
    email: "huongbtt@yahoo.com",
    password: "123456",
    avatar: "/images/bui-thi-thanh-huong.jpg"
  },
  {
    username: "user9",
    name: "Nguyễn Hoài Nam",
    email: "nguyenhoainam.b@gmail.com",
    password: "123456",
    avatar: "/images/user9.jpg"
  },
  {
    username: "user10",
    name: "Nguyễn Hoàng Hà",
    email: "nguyenhoangha.biz@gmail.com",
    password: "123456",
    avatar: "/images/user10.jpg"
  }
]

async function InitUser (request, response) {
  await User.deleteMany({})
  let arrayPromise = []

  for(let user of users) {
    arrayPromise.push(
      new Promise(resolve => {
        let newUser = new User(user)
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
    const users = await User.find({})

    for(let i = 0; i < users.length; i++) {
      let friends = []

      for(let j = 0; j < users.length; j++) {
        if(users[i]._id !== users[j]._id) {
          friends.push(users[j]._id)
        }
      }
      users[i].friends = friends
      users[i].save()
    }

    return response.status(200).json({ success: true })
  } catch(error) {
    console.log(error)
    return response.status(500).json({ status: 500, message: "Oops! Something wrong!", error })
  }
}

export {
  InitUser,
  GetUser,
  InitUserFriend
}