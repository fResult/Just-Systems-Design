#!/bin/bash # <!-- markdownlint-disable-line MD018 MD041 -->

# Publisher/Subscriber Pattern - Subscriber (News Alerts)

## Jump to the current directory

cd "$(dirname "$0")" || return

# Run code

TOPIC_ID=news-alerts pnpm ts-node $WORK_DIR/subscriber.ts
