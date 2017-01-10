#!/bin/sh -e

cd examples
mkdir -p __build__
for ex in async-data custom-menu managed-menu-visibility static-data; do
    NODE_ENV=production browserify ${ex}/app.js -t babelify > __build__/${ex}.js
done
