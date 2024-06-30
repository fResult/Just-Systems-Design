import express, { RequestHandler } from "express"
import fs from "fs"

import { RequestParams, StoredStatus, RequestBody, ErrorResponse, DataResponse } from ":@/server"

const WORK_DIR = process.env.WORK_DIR
const DATA_DIR = "mydb-data"

const app = express()
app.use(express.json())

const hashTable: Record<string, string> = {}

const storeToMemory: RequestHandler<RequestParams, StoredStatus, RequestBody> = (
  req,
  res,
) => {
  hashTable[req.params.key] = req.body.data
  res.send("Success")
}

const getFromMemory: RequestHandler<RequestParams, string> = (req, res) => {
  const key = req.params.key

  if (key in hashTable) {
    return res.send(hashTable[key])
  }

  res.send("null")
}

const storeToDisk: RequestHandler<RequestParams, StoredStatus | ErrorResponse, RequestBody> = (req, res, next) => {
  const destinationFile = `${WORK_DIR}/${DATA_DIR}/${req.params.key}`

  try {
    fs.writeFileSync(destinationFile, req.body.data)
    res.send("Success")
  } catch (e) {
    const error = e as Error
    console.error(error.message)

    res.json({ error: error.message })
  }
}

const getFromDisk: RequestHandler<RequestParams, DataResponse | ErrorResponse> = (
  req,
  res,
) => {
  const destinationFile = `${WORK_DIR}/${DATA_DIR}/${req.params.key}`

  try {
    const data = fs.readFileSync(destinationFile).toString()

    res.json({ data })
  } catch (e) {
    const error = e as Error
    console.error(error.message)

    res.json({ error: error.message })
  }
}

app.post("/memory/:key", storeToMemory)
app.get("/memory/:key", getFromMemory)
app.post("/disk/:key", storeToDisk)
app.get("/disk/:key", getFromDisk)

app.listen(3001, () => console.log("Listening on port 3001!"))
