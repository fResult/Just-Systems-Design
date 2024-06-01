#!/bin/bash

# Rate Limiting - (API Invocation)

## By MyName

curl -H 'user: MyName' localhost:3000/index.html

## By YourName

curl -H 'user: YourName' localhost:3000/index.html

## By MyName again

curl -H 'user: MyName' localhost:3000/index.html

## By YourName again

curl -H 'user: YourName' localhost:3000/index.html
