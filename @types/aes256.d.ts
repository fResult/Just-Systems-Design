declare module "aes256" {
  export function encrypt(key: string, plaintext: string): string
  export function decrypt(key: string, cipherText: string): string
}
