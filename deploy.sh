#!/usr/bin/env bash

cd build &&
npm i &&
node ./deploy.js "$@"
