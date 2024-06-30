<!-- markdownlint-disable-next-line MD018 MD041 -->
#!/bin/bash

# Publisher/Subscriber Pattern

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=22_publisher-subscriber-pattern

## Run code

pnpm concurrently "./$WORK_DIR/run-server.md"\
  "sleep 1 && ./$WORK_DIR/run-subscriber-news.md"\
  "sleep 1 && ./$WORK_DIR/run-subscriber-stock-1.md"\
  "sleep 1 && ./$WORK_DIR/run-subscriber-stock-2.md"\
  "sleep 1 && ./$WORK_DIR/run-subscriber-youtube.md"
