#!/bin/bash

# MapReduce

## Jump to the current directory

cd "$(dirname "$0")" || return

## Setup variable before running the code

export WORK_DIR=23_map-reduce

### Clean up stray files from the previous run

rm -f host1/map-results/*.txt
rm -f host2/map-results/*.txt
rm -f map-results/*.txt
rm -f reduce-results/results.txt

## Run the map step on both hosts in parallel

HOST=$WORK_DIR/host1 pnpm ts-node $WORK_DIR/map.ts &
HOST=$WORK_DIR/host2 pnpm ts-node $WORK_DIR/map.ts &

## Wait for them to both be done

wait

## Run the shuffle step

HOSTS=$WORK_DIR/host1,$WORK_DIR/host2 pnpm ts-node $WORK_DIR/shuffle.ts

## Run the reduce step

pnpm ts-node $WORK_DIR/reduce.ts

## View the final result of the MapReduce job

cat reduce-results/results.txt

## Teardown

unset WORK_DIR
unset HOST
unset HOSTS
