#!/usr/bin/env bash

if [ "$1" != "client" ] && [ "$1" != "server" ] && [ "$1" != "both" ] ; then
    echo "Usage: deploy.sh <client|server|both>"
    exit 1
fi

if [ "$2" != "--skip-package" ] ; then
    ./package.sh "$1"
fi

if [ "$1" == "client" ] || [ "$1" == "both" ] ; then
    echo "Deploying client..."
    node ./build/deploy.js client
fi

if [ "$1" == "server" ] || [ "$1" == "both" ] ; then
    echo "Deploying server..."
    node ./build/deploy.js server
fi

echo "Done"
