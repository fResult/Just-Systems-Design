type Key = string
type Value = string

const database: Record<Key, Value> = {
  ["index.html"]: "<html>Hello World!</html>",
}

export function get(key: Key, callback: (value: Value) => void): void {
  setTimeout(() => {
    callback(database[key] || "")
  }, 3000)
}
