#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Publisher/Subscriber Pattern - Subscriber (Stock Prices)

## Jump to the current directory

cd "$(dirname "$0")" || return

# Run code

TOPIC_ID=stock-prices pnpm ts-node $WORK_DIR/subscriber.ts
