# Replication and Sharding

## Scripts

1. Run server and subscribers

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./15_replication-n-sharding/run.md
    ```

2. Test by `cURL`

    1. Add data into the `sharded-db1/a

    ```bash
    curl -H 'Content-Type: application/json' -d '{"data": "Here is some data"}' localhost:8000/a
    ```
