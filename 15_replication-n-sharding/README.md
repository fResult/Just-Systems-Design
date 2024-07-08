# Replication and Sharding

## Scripts

1. Run server and subscribers

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./15_replication-n-sharding/run.md
    ```

2. Test by `cURL`

    1. Add data into the `sharded-db1/a` by visiting `http://localhost:8000/a`

        ```bash
        curl -H 'Content-Type: application/json' -d "{\"data\": \"[$(date '+%Y-%m-%d %H:%M:%S')] Here is some data\"}" localhost:8000/a
        ```

    2. Get data from the `sharded-db1/a` by visiting `http://localhost:8000/a`

        ```bash
        curl -w "\n" localhost:8000/a
        ```

    3. Add data into the `sharded-db1/b` by visiting `http://localhost:8000/b`

        ```bash
        curl -H 'Content-Type: application/json' -d "{\"data\": \"[$(date '+%Y-%m-%d %H:%M:%S')] Here is some data\"}" localhost:8000/b
        ```

    4. Get data from the `sharded-db1/b` by visiting `http://localhost:8000/b`

        ```bash
        curl -w "\n" localhost:8000/b
        ```
