import * as fs from "fs/promises"

const HOSTS = process.env.HOSTS?.split(",") || []

async function processMapResults(): Promise<void> {
  for (const host of HOSTS) {
    try {
      const fileNames = await fs.readdir(`${host}/map-results`, "utf-8")

      for (const fileName of fileNames) {
        const [key, _ext] = fileName.split(".")
        const contents = await fs.readFile(`${host}/map-results/${fileName}`, "utf-8")
        await fs.appendFile(`${process.env.WORK_DIR}/map-results/${key}.txt`, contents)
      }
    } catch (error) {
      console.error(`Error processing host ${host}:`, error)
    }
  }
}

processMapResults()
