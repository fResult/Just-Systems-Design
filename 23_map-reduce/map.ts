import * as mapReduce from "./map-reduce"

async function map(text: string): Promise<void> {
  const lines = text.split("\n")

  for (const line of lines) {
    const latency = parseInt(line)

    if (latency < 10000) {
      await mapReduce.emitMapResult("under-10-seconds", "1")
    } else {
      await mapReduce.emitMapResult("over-10-seconds", "1")
    }
  }
}

;(async () => {
  const latenciesText: string = await mapReduce.getMapInput("latencies.txt")
  await map(latenciesText)
})();
