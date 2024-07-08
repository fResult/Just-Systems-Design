import * as database from "./database"
import express from "express"

type RequestHeader = { user: string }

const app = express()

// Keep a hash table of the previous access time for each user
const accesses: Record<string, number> = {}

app.get("/index.html", function (req, res) {
  const { user } = req.headers as RequestHeader

  if (user in accesses) {
    const previousAccessTime = accesses[user]

    // Limit to 1 request every 5 seconds.
    if (Date.now() - previousAccessTime < 5000) {
      res.status(429).send(`Too many requests. (by ${user}) \n`)
      return
    }
  }

  // Serve the page and store this access time.
  database.get("index.html", (page) => {
    accesses[user] = Date.now()
    res.send(`${page} (by ${user})\n`)
  })
})

app.listen(3000, () => console.log("Listening on port 3000."))
