#!/usr/bin/env bash

# Expects cwd to be the root project directory
cd client &&
npm run build &&
cd .. &&
node ./build/build-archive.js
