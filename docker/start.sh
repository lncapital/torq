#!/usr/bin/env bash

# Check that the Docker daemon is running
if ! docker ps > /dev/null; then exit 1; fi

BASEDIR=$(dirname "$0")

docker pull lncapital/torq
docker-compose -f $BASEDIR/docker-compose.yml up  -d

echo Torq is starting, please wait

function timeout() { perl -e 'alarm shift; exec @ARGV' "$@"; }

timeout 300 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:<YourPort>)" != "200" ]]; do sleep 5; done' || false

echo Torq has started and is available on http://localhost:<YourPort>
if [ "$(uname)" == "Darwin" ]; then
    open http://localhost:<YourPort>
fi
if [[ "$(uname)" != "Darwin" && x$DISPLAY != x ]]; then
  xdg-open http://localhost:<YourPort>
fi
