#!/bin/bash

# Replication and Sharding - AEDB Proxy

## Jump to the current directory

cd "$(dirname "$0")" || return

## Run code

pnpm ts-node $WORK_DIR/mydb-proxy.ts
