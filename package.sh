#!/usr/bin/env bash

if [ "$1" != "client" ] && [ "$1" != "server" ] && [ "$1" != "both" ] ; then
    echo "Usage: package.sh <client|server|both>"
    exit 1
fi

echo "Ensuring build dependencies are installed..."
cd build &&
npm i &&
cd ..

if [ "$1" == "client" ] || [ "$1" == "both" ] ; then
    echo "Building client..."
    cd client &&
    npm i &&
    npm run build &&
    cd .. &&
    node ./build/package.js client
fi

if [ "$1" == "server" ] || [ "$1" == "both" ] ; then
    echo "Building server..."
    cd server &&
    npm i &&
    npm run build &&
    cd .. &&
    node ./build/package.js server
fi

echo "Done"
