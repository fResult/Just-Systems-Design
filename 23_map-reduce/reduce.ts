import * as mapReduce from "./map-reduce"

async function reduce(key: string, values: string[] | number[]): Promise<void> {
  const valuesCount = values.length

  mapReduce.emitReduceResult(key, valuesCount)
}

async function main() {
  try {
    const reduceInputs = await mapReduce.getReduceInputs()

    for (const input of reduceInputs) {
      const [key, values] = input
      await reduce(key, values)
    }
  } catch (error) {
    console.error("Error during map-reduce:", error)
  }
}

main()
