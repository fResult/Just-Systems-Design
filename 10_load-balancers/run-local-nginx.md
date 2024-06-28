# Load Balancers - Local NGINX

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=$(/bin/pwd)

## Run NGINX

nginx -c $WORK_DIR/nginx.conf
