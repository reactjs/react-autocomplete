#!/bin/sh -e

mkdir -p examples/__build__
watchify examples/managed-menu-visibility/app.js -t babelify -p [browserify-hmr --port 1339 --url http://localhost:1339] -v -o examples/__build__/managed-menu-visibility.js
