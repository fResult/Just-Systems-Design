# Network Protocols

## Scripts

1. Run server

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./04_network-protocols/run.md
    ```

2. Test API Routes

    1. GET `/hello`

        ```bash
        curl localhost:3000/hello
        ```

    2. POST `/hello`

        ```bash
        curl -H 'Content-Type: application/json' -d '{"foo":"bar"}' localhost:3000/hello
        ```
