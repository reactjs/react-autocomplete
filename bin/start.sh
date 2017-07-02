#!/bin/sh -e

mkdir -p examples/__build__
concurrently --kill-others \
  "st --port 8080 --dir examples --index index.html" \
  "watchify examples/async-data/app.js -t babelify -p [browserify-hmr --port 1337 --url http://localhost:1337] -v -o examples/__build__/async-data.js" \
  "watchify examples/custom-menu/app.js -t babelify -p [browserify-hmr --port 1338 --url http://localhost:1338] -v -o examples/__build__/custom-menu.js" \
  "watchify examples/managed-menu-visibility/app.js -t babelify -p [browserify-hmr --port 1339 --url http://localhost:1339] -v -o examples/__build__/managed-menu-visibility.js" \
  "watchify examples/static-data/app.js -t babelify -p [browserify-hmr --port 1340 --url http://localhost:1340] -v -o examples/__build__/static-data.js"
