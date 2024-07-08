import express, { type RequestHandler } from "express"
import * as db from "./database"

const app = express()
const cache: Record<string, string> = {}


const withCache: RequestHandler = (req, res) => {
  if ('index.html' in cache) {
    return res.send(cache['index.html'])
  }

  db.get('index.html', (value) => {
    cache['index.html'] = value
    res.send(value)
  })
}

const withoutCache: RequestHandler = (req, res) => {
  db.get('index.html', (value) => {
    res.send(value)
  })
}

app.listen(3000, () => console.log("Listening on port 3000!"))
app.get("/with-cache/index.html", withCache)
app.get("/no-cache/index.html", withoutCache)
