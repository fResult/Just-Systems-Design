#!/bin/bash

# Hashing

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=11_hashing

## Run code

pnpm ts-node $WORK_DIR/hash-example.ts
