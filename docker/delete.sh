#!/usr/bin/env bash

# Check that the Docker daemon is running
if ! docker ps > /dev/null; then exit 1; fi

BASEDIR=$(dirname "$0")

read -p "Are you wish to delete Torq including data? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker-compose -f $BASEDIR/docker-compose.yml  down -v
fi
