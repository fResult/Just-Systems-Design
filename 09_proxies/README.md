# Proxies

## Scripts

1. Run server

    ```bash
   ./run.md
    # OR if you are in the root directory
    ./09_proxies/run.md
    ```

**Here is the round-robin load balancer strategy sample by Nginx:**

```nginx
events { }

http {
    upstream nodejs-backend {
        server localhost:3000;
    }

    server {
        listen 8081;

        location / {
            proxy_set_header X-Service my-service;
            proxy_pass http://nodejs-backend;
        }
    }
}
```
