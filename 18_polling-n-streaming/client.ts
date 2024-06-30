import { RawData } from "ws"
import { Message } from ":@/socket"

import * as helpers from "./helpers"
import * as messagingApi from "./messaging-api"
import readline from "readline"

const displayedMessages: Record<number, boolean> = {}

const terminal = readline.createInterface({
  input: process.stdin,
})

terminal.on("line", async (text) => {
  const username = process.env.NAME || "Anonymous"
  const id = helpers.getRandomInt(1_000_000)
  displayedMessages[id] = true

  const message: Message = { id, text, username }
  await messagingApi.sendMessage(message)
})

function displayMessage(message: Message) {
  console.log(`> ${message.username}: ${message.text}`)
  displayedMessages[message.id] = true
}

async function getAndDisplayMessages() {
  const messages = await messagingApi.getMessages()

  for (const message of messages) {
    const messageAlreadyDisplayed = message.id in displayedMessages
    if (!messageAlreadyDisplayed) displayMessage(message)
  }
}

function pollMessages() {
  setInterval(getAndDisplayMessages, 3000)
}

function streamMessages() {
  const messagingSocket = messagingApi.createMessagingSocket()

  messagingSocket.on("message", (data: RawData) => {
    const message = JSON.parse(data.toString()) as Message
    const messageAlreadyDisplayed = message.id in displayedMessages
    if (!messageAlreadyDisplayed) displayMessage(message)
  })
}

async function main() {
  if (process.env.MODE === "poll") {
    await getAndDisplayMessages()
    pollMessages()
  } else if (process.env.MODE === "stream") {
    await getAndDisplayMessages()
    streamMessages()
  }
}

main()
