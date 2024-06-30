<!-- markdownlint-disable-next-line MD018 MD041 -->
#!/bin/bash

# Publisher/Subscriber Pattern - Publisher (Stock Broker)

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=22_publisher-subscriber-pattern

## Run code

(for i in `seq 1 10000`; do sleep 1; echo New Stock Price; done) | NAME=STOCK_BROKER TOPIC_ID=stock-prices pnpm ts-node $WORK_DIR/publisher.ts
