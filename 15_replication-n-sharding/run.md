#!/bin/bash

# Replication and Sharding

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=15_replication-n-sharding

### Clean up stray files from the previous run

rm -f sharded-db*/*

## Run code

pnpm concurrently "pnpm ts-node $WORK_DIR/mydb-proxy.ts"\
  "PORT=3000 DATA_DIR=sharded-db1 pnpm ts-node $WORK_DIR/mydb.ts"\
  "PORT=3001 DATA_DIR=sharded-db2 pnpm ts-node $WORK_DIR/mydb.ts"
