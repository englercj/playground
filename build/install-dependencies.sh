#!/usr/bin/env bash

# Expects cwd to be the root project directory
cd client &&
npm install &&
cd ../build &&
npm install archiver
