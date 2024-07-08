import express, { type RequestHandler } from "express"

const PORT = process.env.PORT

const app = express()

const loadBalancer: RequestHandler = (req, res) => {
  console.log(req.headers)
  console.log("Load balancer: Distributing request...")

  res.send(`Hello from port ${PORT}!\n`)
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`))
app.get("/hello", loadBalancer)

