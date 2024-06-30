import axios, { type AxiosResponse } from "axios"
import { WebSocket } from "ws"

import type { Message } from ":@/socket"

function createMessagingSocket() {
  return new WebSocket("ws://localhost:3001/messages")
}

async function getMessages() {
  const { data } = await axios.get<any, AxiosResponse<Array<Message>>>(
    "http://localhost:3001/messages"
  )

  return data
}

async function sendMessage(message: Message) {
  return await axios.post<any, AxiosResponse<null>, Message>(
    "http://localhost:3001/messages",
    message
  )
}

export { createMessagingSocket, getMessages, sendMessage }
