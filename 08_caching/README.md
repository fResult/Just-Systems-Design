# Caching

## Scripts

1. Run server

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./08_caching/run.md
    ```

2. Test

- Without cache - visit `http://localhost:3000/no-cache/index.html`

    ```bash
    curl localhost:3000/no-cache/index.html
    # THEN
    curl localhost:3000/no-cache/index.html
    # THEN
    curl localhost:3000/no-cache/index.html
    ```

    > We will notice that we have to wait for 3 seconds or more every time we visit `/no-cache/index.html`.

- With cache - visit `http://localhost:3000/with-cache/index.html`

    ```bash
    curl localhost:3000/with-cache/index.html
    # THEN
    curl localhost:3000/with-cache/index.html
    # THEN
    curl localhost:3000/with-cache/index.html
    ```

    > We will notice that we have to wait for 3 seconds or more only 1st time we visit `/no-cache/index.html`, after that, the response is responded almost immediately.
