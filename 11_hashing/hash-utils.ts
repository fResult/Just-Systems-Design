function hashString(str: string): number {
  if (str.length === 0) return 0
  let hashed = 0

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    hashed = ((hashed << 5) - hashed) + charCode
    hashed |= 0
  }

  return hashed
}

function computeScore(username: string, server: string): number {
  const usernameHashed = hashString(username)
  const serverHashed = hashString(server)

  return (usernameHashed * 13 + serverHashed * 11) % 67
}

export { hashString, computeScore }
