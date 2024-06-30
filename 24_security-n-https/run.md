<!-- markdownlint-disable-next-line MD018 MD041 -->
#!/bin/bash

# Rate Limiting

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=24_security-n-https

## Run server

pnpm ts-node ./$WORK_DIR/encryption.ts
