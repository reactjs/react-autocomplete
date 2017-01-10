#!/bin/sh -e

mkdir -p examples/__build__
watchify examples/async-data/app.js -t babelify -p [browserify-hmr --port 1337 --url http://localhost:1337] -v -o examples/__build__/async-data.js
