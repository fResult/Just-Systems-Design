#!/bin/bash

# Publisher/Subscriber Pattern - Server

## Jump to the current directory

cd "$(dirname "$0")" || return

## Run code

pnpm ts-node $WORK_DIR/server.ts
