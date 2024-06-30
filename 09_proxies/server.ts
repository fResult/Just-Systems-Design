import express, { type RequestHandler } from "express"

const app = express()

const hello: RequestHandler = (req, res) => {
  console.log(req.headers)
  res.send("Hello.\n")
}

app.listen(3000, () => console.log("Listening on port 3000!"))
app.get("/hello", hello)
