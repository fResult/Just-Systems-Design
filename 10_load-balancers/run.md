# Load Balancers

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=10_load-balancers

## Run servers

### nginx -c $PATH/$WORK_DIR/nginx.conf

pnpm concurrently "./$WORK_DIR/run-local-nginx.md"\
  "PORT=3000 pnpm ts-node $WORK_DIR/server.ts"\
  "PORT=3001 pnpm ts-node $WORK_DIR/server.ts"
