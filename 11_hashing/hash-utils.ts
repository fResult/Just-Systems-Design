function hashString(str: string): number {
  let hash = 0

  if (str.length === 0) return hash

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return hash
}

function computeScore(username: string, server: string): number {
  const usernameHash = hashString(username)
  const serverHash = hashString(server)

  return (usernameHash * 13 + serverHash * 11) % 67
}

export { hashString, computeScore }
