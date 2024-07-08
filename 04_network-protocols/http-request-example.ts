const httpRequest = {
  host: "localhost",
  port: 8080,
  method: "POST",
  path: "/payments",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": 51,
  },
  body: JSON.stringify({ product: "Coffee", price: 5.99, currency: "USD" }),
}

const httpResponse = {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Origin": "https://fResult.dev", // CORS
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: "Payment processed successfully." }),
}
