React Autocomplete
==================

Accessible, extensible, Autocomplete for React.js.

[![Travis build status](https://travis-ci.org/reactjs/react-autocomplete.svg?branch=master)](https://travis-ci.org/reactjs/react-autocomplete/)

Docs coming soon, for now just look at the `propTypes` and [examples](https://reactcommunity.org/react-autocomplete/) :)

Trying to settle on the right API, and then focus hard on accessibility,
there are a few missing bits right now.

Stuff we need help with:

- mobile support verification generally
- default mobile styles/positioniong (you'll notice the styles are
  pretty lean, on purpose, apps should style this however they'd like)
- tests (eventually)

## API

$API_DOC

# Tests!

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
