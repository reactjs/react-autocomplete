#!/bin/sh -e

mkdir -p examples/__build__
watchify examples/static-data/app.js -t babelify -p [browserify-hmr --port 1340 --url http://localhost:1340] -v -o examples/__build__/static-data.js
