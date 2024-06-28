#!/bin/bash

# Replication and Sharding

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=15_replication-n-sharding

export PORT=3001
export DATA_DIR=sharded-db2

## Run code

pnpm concurrently "./$WORK_DIR/run-mydb1.md"\
  "sleep 1 && ./$WORK_DIR/run-mydb2.md"\
  "sleep 1 && ./$WORK_DIR/run-mydb-proxy.md"
