#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Polling and Streaming - Client (Polling)

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=18_polling-n-streaming

## Run client

NAME=Korn MODE=poll pnpm ts-node ./$WORK_DIR/client.ts
