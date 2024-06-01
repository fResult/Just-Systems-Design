import express, { Express } from "express"
import expressWs, { WithWebsocketMethod } from "express-ws"
import WebSocket from "ws"

const app: Express = express()
expressWs(app)

const sockets: { [topicId: string]: WebSocket[] } = {}

app.use(express.json())

app.listen(3001, () => {
  console.log("Listening on port 3001!")
})

app.post("/:topicId", (req, res) => {
  const { topicId } = req.params
  const message = req.body
  const topicSockets = sockets[topicId] || []

  for (const socket of topicSockets) {
    socket.send(JSON.stringify(message))
  }
})

const appWebSocket = app as Express & WithWebsocketMethod

appWebSocket.ws("/:topicId", (socket, req) => {
  const { topicId } = req.params

  if (!sockets[topicId]) sockets[topicId] = []

  const topicSockets = sockets[topicId]
  topicSockets.push(socket)

  socket.on("close", () => {
    topicSockets.splice(topicSockets.indexOf(socket), 1)
  })
})
