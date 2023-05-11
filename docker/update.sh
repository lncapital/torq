#!/usr/bin/env bash

# Check that the Docker daemon is running
if ! docker ps > /dev/null; then exit 1; fi

BASEDIR=$(dirname "$0")

docker-compose -f $BASEDIR/docker-compose.yml down
docker pull lncapital/torq
docker-compose -f $BASEDIR/docker-compose.yml up -d
