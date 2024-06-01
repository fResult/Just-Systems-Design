import * as fs from "fs/promises"

const HOST = process.env.HOST
const WORK_DIR = process.env.WORK_DIR

async function getMapInput(fileName: string): Promise<string> {
  const path = `${HOST}/${fileName}`
  return await fs.readFile(path, "utf-8")
}

async function emitMapResult(key: string, value: string): Promise<void> {
  const fileName = `${HOST}/map-results/${key}.txt`
  await fs.appendFile(fileName, value + "\n")
}

async function getReduceInputs(): Promise<[string, string[]][]> {
  const fileNames = await fs.readdir(`${WORK_DIR}/map-results`, "utf-8")
  const inputs: [string, string[]][] = []

  for (const fileName of fileNames) {
    const [key, _ext] = fileName.split(".")
    const contents: string = await fs.readFile(`${WORK_DIR}/map-results/${fileName}`, "utf-8")
    inputs.push([key, contents.split("\n").filter((value) => value !== "")])
  }
  return inputs
}

async function emitReduceResult(key: string, value: number): Promise<void> {
  const fileName = `${WORK_DIR}/reduce-results/results.txt`
  await fs.appendFile(fileName, `${key} ${value}\n`)
}

export { getMapInput, emitMapResult, getReduceInputs, emitReduceResult }
