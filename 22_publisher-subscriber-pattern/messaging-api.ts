import axios from "axios"
import WebSocket from "ws"

export type Message = {
  name: string
  text: string
}

export function publish(message: Message, topicId: string) {
  return axios.post(`http://localhost:3001/${topicId}`, message)
}

export function subscribe(topicId: string) {
  return new WebSocket(`ws://localhost:3001/${topicId}`)
}
