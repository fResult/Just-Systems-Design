import axios from "axios"
import express, { Request, Response } from "express"

const SHARD_ADDRESSES: string[] = ["http://localhost:3000", "http://localhost:3001"]
const SHARD_COUNT: number = SHARD_ADDRESSES.length

const app = express()
app.use(express.json())

function getShardEndpoint(key: string): string {
  const shardNumber: number = key.charCodeAt(0) % SHARD_COUNT
  const shardAddress: string = SHARD_ADDRESSES[shardNumber]

  return `${shardAddress}/${key}`
}

app.post("/:key", (req: Request, res: Response) => {
  const shardEndpoint: string = getShardEndpoint(req.params.key)
  console.log(`Forwarding to: ${shardEndpoint}`)

  axios.post(shardEndpoint, req.body).then((innerRes) => {
    res.send()
  })
})

app.get("/:key", (req: Request, res: Response) => {
  const shardEndpoint: string = getShardEndpoint(req.params.key)
  console.log(`Forwarding to: ${shardEndpoint}`)

  axios.get(shardEndpoint).then((innerRes) => {
    if (innerRes.data === null) {
      return res.send("null")
    }

    res.send(innerRes.data)
  })
})

app.listen(8000, () => console.log("Listening on port 8000!"))
