import * as utils from "./hash-utils"

const serverSet = makeThingsFrom0ToN("server", 5)
const serverSetWithoutServer5 = makeThingsFrom0ToN("server", 4)
const usernames = makeThingsFrom0ToN("username", 9)

function makeThingsFrom0ToN(thing: string, n: number): string[] {
  const length = n + 1

  return Array.from({ length }, (_, i) => `${thing}${i}`)
}

function pickServerSimple(username: string, servers: string[]): string {
  const hashed = utils.hashString(username)
  const idx = hashed % servers.length

  return servers[idx]
}

function pickServerRendezvous(username: string, servers: string[]): string {
  let maxServer: string | null = null
  let maxScore: number | null = null

  servers.forEach((server) => {
    const score = utils.computeScore(username, server)

    if (maxScore === null || score > maxScore) {
      maxScore = score
      maxServer = server
    }
  })

  return maxServer!
}

function testServersHashing(
  usernames: string[],
  serverSet1: string[],
  serverSet2: string[],
  pickServer: (username: string, servers: string[]) => string
): string[] {
  return usernames.map((username) => {
    const server1 = pickServer(username, serverSet1)
    const server2 = pickServer(username, serverSet2)

    return `${username}: ${server1} => ${server2} | equal: ${server1 === server2}`
  })
}

function main(): void {
  const test1 = testServersHashing(usernames, serverSet, serverSetWithoutServer5, pickServerSimple)
  const test2 = testServersHashing(
    usernames,
    serverSet,
    serverSetWithoutServer5,
    pickServerRendezvous
  )

  const display = (message: string) => console.log(message)

  console.log("Simple Hashing Strategy:")
  test1.forEach(display)

  console.log("\nRendezvous Hashing Strategy:")
  test2.forEach(display)
}

main()
