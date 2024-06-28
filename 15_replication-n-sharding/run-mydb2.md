#!/bin/bash

# Replication and Sharding - AEDB2

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export PORT=3001
export DATA_DIR=sharded-db2

## Run code

pnpm ts-node $WORK_DIR/mydb.ts
