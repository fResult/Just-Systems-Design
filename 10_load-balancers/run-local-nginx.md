# Load Balancers - Local NGINX

## Jump to the current directory

cd "$(dirname "$0")" || return

## Teardown

### Setup variable before running the code

export WORK_DIR=$(/bin/pwd)

### Set up exit trap to stop NGINX when the script exits

trap 'nginx -s stop' EXIT

## Run NGINX

nginx -c $WORK_DIR/nginx.conf

## Teardown

### Keep the script running

while true; do sleep 1; done
