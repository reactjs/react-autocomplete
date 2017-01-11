# React Autocomplete [![Travis build status](https://travis-ci.org/reactjs/react-autocomplete.svg?branch=master)](https://travis-ci.org/reactjs/react-autocomplete/)

Accessible, extensible, Autocomplete for React.js.

[Examples](https://reactcommunity.org/react-autocomplete/)

## API

$API_DOC

## Tests!

Run them:
`npm test`

Write them:
`lib/__tests__/Autocomplete-test.js`

Check your work:
`npm run coverage`

## Publishing / Releasing

* `rackt build` (you probably need to temporarily delete/move `.babelrc`)
* `npm run generate-readme`
* `git commit README.md build/* dist/* -m 'Update build and dist files'`
* Update `CHANGELOG.md`
* `git commit CHANGELOG.md -m 'Update CHANGELOG with x.x.x release'`
* `npm version x.x.x`
* `npm publish`
* `git push origin/master --follow-tags`
