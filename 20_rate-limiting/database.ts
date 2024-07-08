const database: Record<string, string> = {
  "index.html": "<html>Hello World!</html>",
}

export function get(key: string, callback: <T>(x: T) => void): void {
  setTimeout(() => {
    callback(database[key])
  }, 1000)
}
