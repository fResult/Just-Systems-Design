#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Key-Value Stores

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=13_key-value-stores

## Prepare Running Redis

## Run code

pnpm ts-node ./$WORK_DIR/server.ts
