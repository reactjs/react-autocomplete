#!/bin/sh -e

mkdir -p examples/__build__
watchify examples/custom-menu/app.js -t babelify -p [browserify-hmr --port 1338 --url http://localhost:1338] -v -o examples/__build__/custom-menu.js
