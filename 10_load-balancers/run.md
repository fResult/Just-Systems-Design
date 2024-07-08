#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Load Balancers

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=10_load-balancers

## Run servers and reverse proxy server

pnpm concurrently "./$WORK_DIR/run-local-nginx.md"\
  "PORT=3000 pnpm ts-node $WORK_DIR/server.ts"\
  "PORT=3001 pnpm ts-node $WORK_DIR/server.ts"

### Stop NGINX after terminating services

nginx -s stop
