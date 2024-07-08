import * as aes256 from "aes256"

const key = "secret-key-1"
const otherKey = "secret-key-2"

const plainText = "Plain Text Na Ja"

try {
  const encrypted = aes256.encrypt(key, plainText)
  console.log("Encrypted:", encrypted)

  const decrypted = aes256.decrypt(key, encrypted)
  console.log("Decrypted:", decrypted)

  const failedDecrypted = aes256.decrypt(otherKey, decrypted)
  console.log("Failed Decrypted:", failedDecrypted)
} catch (err) {
  const typeError: TypeError = err as TypeError
  console.error(`${typeError.name}:`, typeError.message)
}
