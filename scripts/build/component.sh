#!/bin/sh -e

export NODE_ENV=production
mkdir -p build/lib dist
babel lib/{index,Autocomplete}.js -d build/
cd dist
browserify ../lib/Autocomplete.js \
    --transform babelify \
    --external react \
    --external react-dom \
    --external prop-types \
    --debug \
  | youemdee ReactAutocomplete \
    --dependency react:React \
    --dependency react-dom:ReactDOM \
    --dependency prop-types:PropTypes \
  | exorcist react-autocomplete.js.map \
  > react-autocomplete.js
uglifyjs react-autocomplete.js \
    --compress \
    --mangle \
    --in-source-map react-autocomplete.js.map \
    --source-map react-autocomplete.min.js.map \
  > react-autocomplete.min.js
