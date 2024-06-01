import * as messagingApi from "./messaging-api"

const TOPIC_ID = process.env.TOPIC_ID!

function displayMessage(message: messagingApi.Message) {
  console.log(`> ${message.name}: ${message.text}`)
}

function streamMessages() {
  const messagingSocket = messagingApi.subscribe(TOPIC_ID)
  console.info(`:: Subscriber subscribes on topic: ${TOPIC_ID}`)

  messagingSocket.on("message", (data: string) => {
    const message = JSON.parse(data)
    displayMessage(message)
  })
}

streamMessages()
