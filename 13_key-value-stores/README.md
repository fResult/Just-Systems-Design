# Key-Value Stores

## Scripts

1. Start `redis-stack-server` service in your local machine first
    (If you didn't install yet, [click here](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack))

2. Run this command below

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./13_key-value-stores/run.md
    ```

3. Test Redis cache

    3.1. visit to <http://127.0.0.1/nocache/index.html> (we have to wait for 3 seconds every time)\
    3.2. visit to <http://127.0.0.1/withcache/index.html> (we have to wait for 3 seconds first time, and next time, hit cached for 5 seconds.)
