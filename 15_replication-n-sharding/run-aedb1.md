#!/bin/bash

# Replication and Sharding - AEDB1

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export PORT=3000
export DATA_DIR=sharded-db1

## Run code

pnpm ts-node $WORK_DIR/aedb.ts
