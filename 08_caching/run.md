#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Caching

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=08_caching

## Run server

pnpm ts-node $WORK_DIR/server.ts
