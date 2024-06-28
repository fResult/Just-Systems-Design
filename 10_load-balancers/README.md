# Load Balancers

## Scripts

1. Run servers and nginx

    ```bash
    ./run.md
    # OR if you are in the root directory
    ./10-load-balancers/run.md
    ```

2. Test round-robin server selection strategy by visiting to `http://localhost:8081/hello` a few times, and see results

    ```bash
    curl localhost:8081/hello
    # THEN
    curl localhost:8081/hello
    # THEN
    curl localhost:8081/hello
    # THEN
    curl localhost:8081/hello
    ```

3. After finish testing, when you terminate by `CTRL` + `C`, we have to stop nginx by sending "SIGTERM" signal

    ```bash
    nginx -s stop
    ```

**Here is the round-robin load balancer strategy sample by Nginx:**

```nginx
events { }

http {
    upstream nodejs-backend {
        server localhost:3000 weight=3;
        server localhost:3001;
    }

    server {
        listen 8081;

        location / {
            proxy_set_header x-service my-service;
            proxy_pass http://nodejs-backend;
        }
    }
}
```
