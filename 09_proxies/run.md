#!/bin/bash

# Proxies

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=09_proxies

## Run servers and reverse proxy server

pnpm concurrently "$WORK_DIR/run-local-nginx.md"\
  "pnpm ts-node $WORK_DIR/server.ts"

## Teardown

### Stop NGINX after terminating services

nginx -s stop
