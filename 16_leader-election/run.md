#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Leader Election

## Jump to the current direction

cd "$(dirname "$s0")" || return

## Setup variable before running the code

export WORK_DIR=16_leader-election

# Run Server

pnpm concurrently "SERVER_NAME=Server1 pnpm ts-node ./$WORK_DIR/leader-election.ts"\
  "SERVER_NAME=Server2 pnpm ts-node $WORK_DIR/leader-election.ts"
