<!-- markdownlint-disable-next-line MD018 MD041 -->
#!/bin/bash

# Publisher/Subscriber Pattern - Publisher (News Station)

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=22_publisher-subscriber-pattern

## Run code

(for i in `seq 1 10000`; do sleep 1; echo New Stock Price; done) | NAME=NEWS_STATION TOPIC_ID=news-alerts pnpm ts-node $WORK_DIR/publisher.ts
