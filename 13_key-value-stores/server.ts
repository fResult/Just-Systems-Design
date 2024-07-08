import express, { Express, Request, Response } from "express"
import Redis from 'ioredis'

import * as database from "./database"

const redisClient = new Redis({
  // host: "127.0.0.1",
  // port: 6739,
})
const app: Express = express()

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error.message)
  redisClient.quit()
})

app.get("/nocache/index.html", (req: Request, res: Response) => {
  database.get("index.html", (page: string) => {
    res.send(page)
  })
})

app.get("/withcache/index.html", async (req: Request, res: Response) => {
  try {
    const data = await redisClient.get("index.html")
    if (data) return res.send(data)

    database.get("index.html", async (page: string) => {
      await redisClient.set("index.html", page, "EX", 5)
      res.send(page)
    })
  } catch (error) {
    console.error(error)
    res.send(error)
  }
})

app.listen(3001, () => {
  console.log("Listening on port 3001!")
})
