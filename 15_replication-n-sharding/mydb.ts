import express from "express"
import { Request, Response } from "express"
import fs from "fs"

const PORT = process.env.PORT
const WORK_DIR = process.env.WORK_DIR
const DATA_DIR = process.env.DATA_DIR

const app = express()
app.use(express.json())

app.post("/:key", (req: Request, res: Response) => {
  const { key } = req.params
  const destinationFile = `${WORK_DIR}/${DATA_DIR}/${key}`

  console.log(`Storing data at key ${key}.`)

  try {
    fs.writeFileSync(destinationFile, req.body.data)
    res.json({ result: `Saved data: "${req.body.data}" to "${DATA_DIR}/${key}"` })
  } catch (e) {
    const error = e as Error
    console.error(error.stack)

    res.json({ error: error.message })
  }
})

app.get("/:key", (req: Request, res: Response) => {
  const { key } = req.params
  const destinationFile = `${WORK_DIR}/${DATA_DIR}/${key}`

  console.log(`Retrieving data from key ${key}.`)

  try {
    const data = fs.readFileSync(destinationFile)
    res.json({ data })
  } catch (e) {
    const error = e as Error
    console.error(error.stack)

    res.send("null")
  }
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
