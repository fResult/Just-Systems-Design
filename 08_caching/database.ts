const database: Record<string, string> = {
  'index.html': '<html>Hello World!</html>',
}

function get(key: string, callback: (value: string) => void): void {
  setTimeout(() => {
    callback(database[key])
  }, 3000);
}

export { get }
