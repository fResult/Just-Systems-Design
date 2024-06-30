#!/bin/bash

# Network Protocols

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=04_network-protocols

## Run server

pnpm ts-node $WORK_DIR/server.ts
