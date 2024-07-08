#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Rate Limiting

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=20_rate-limiting

## Run server

pnpm ts-node ./$WORK_DIR/server.ts
