import { Message } from ":@/socket"
import express, { RequestHandler, type Express } from "express"
import expressWs, { type WithWebsocketMethod } from "express-ws"
import WebSocket from "ws"

const app = express() as Express & WithWebsocketMethod
expressWs(app)
app.use(express.json())

const messages = [{ id: 0, text: "Welcome!", username: "Chat Room" }]
const sockets: Array<WebSocket> = []

const newMessage: RequestHandler<null, null, Message> = (req) => {
  const message = req.body
  messages.push(message)

  for (const socket of sockets) {
    socket.send(JSON.stringify(message))
  }
}

const getMessages: RequestHandler<null, Array<Message>> = (_, res) => {
  res.json(messages)
}


app.listen(3001, () => console.log("Listening on port 3001!"))

app.get("/messages", getMessages)
app.post("/messages", newMessage)

app.ws("/messages", (socket) => {
  sockets.push(socket)

  socket.on("close", () => {
    sockets.splice(sockets.indexOf(socket), 1)
  })
})
