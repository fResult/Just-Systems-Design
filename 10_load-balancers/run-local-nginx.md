<!-- markdownlint-disable-next-line MD018 MD041 -->
#!/bin/bash

# Load Balancers - Local NGINX

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup

### Setup variable before running the code

export WORK_DIR=$(/bin/pwd)

### Set up exit trap to stop NGINX when the script exits

nginx_stop() {
  nginx -s stop
  echo "NGINX service stopped"
}
trap nginx_stop EXIT

## Run NGINX

nginx -c $WORK_DIR/nginx.conf
echo "NGINX is listening on port 8081!"

## Teardown

### Keep the script running

while true; do sleep 1; done
