import Message from "../../../models/Message"

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

async function GetMessage(request, response) {
  const props = ["group"]

  let query = {}
  
  console.log("request.query.group", request.query.group)

  for(let prop of props) {
    if(request.query[prop]) {
      query[prop] = request.query[prop]
    }
  }


  const messages = await Message.find(query)
  
  return response.status(200).json({ status: 200, messages })
}

async function PostMessage(request, response) {
  const { authenticate } = request
  const props = ["groupId", "type", "content"]

  for(let prop of props) {
    if(!request.body[prop]) {
      return response.status(400).json({ status: 400, messages: "Field " + prop + " is required"})
    }
  }

  new Message({
    user: authenticate._id,
    group: request.body.groupId,
    createdTime: Date.now(),
    type: request.body.type,
    content: request.body.content
  }).save()

  return response.status(200).json({ status: 200 })
}

export {
  PostMessage,
  GetMessage
}