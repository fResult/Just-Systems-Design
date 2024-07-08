import readline from "readline"
import * as messagingApi from "./messaging-api"

const TOPIC_ID = process.env.TOPIC_ID as string

const terminal = readline.createInterface({
  input: process.stdin,
})

terminal.on("line", (text: string) => {
  const name = process.env.NAME as string
  const message: messagingApi.Message = { name, text }

  messagingApi.publish(message, TOPIC_ID)
})
