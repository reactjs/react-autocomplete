# CHANGELOG
We try to follow [http://keepachangelog.com/](http://keepachangelog.com/) recommendations for easier to update & more readable change logs.

## Unreleased
_(add items here for easier creation of next log entry)_
### Fixed
- .babelrc presets were causing 1 user(s) to not be able to run tests locally with Jest


## [1.1.0] - 2015-12-03
### Added
- Ability to return custom components from renderMenu/renderItem (see #127)
- Added missing `propTypes`
- Jest for testing (replaces mocha/isparta)
- eslint consuming the rackt config

### Fixed
- Custom Menu Example (#81)
- Bug causing menu to close immediately when clicking into input (#84)
- Bug referencing `this.state.value` (has since been moved to props)
- Reset `highlightedIndex` when it's outside `items.length` (#139)
- Removed typeahead behavior for improved mobile functionality (#40, #111, #152)

### Updated
- rackt-cli (#131, #51, #107)
- repo urls (#114)
- Jest ignore rules & configurations


v1.0.1 - 26 June 2016
--------------------------------------

- Fixed compatibility issues with React 15.x, removed use of previously deprecated APIs

v1.0.0 - 17 June 2016
--------------------------------------

- Additional failing tests fixed, pre-publish build with 1.0.0 changes

v1.0.0-rc6 - 5 June 2016
--------------------------------------

- Updated propTypes for several props being used but not included here
- Several issues and fixes from #68, #84, #92, #93, #103, #104, #106
- Actually built the build/dist files and included them in the publish

v1.0.0-rc5 - 5 June 2016
--------------------------------------

- Dependencies clean up (removed duplicates and large lodash dependency)
- Demoted React to peerDependency


v1.0.0-rc3 - 25 May 2016
--------------------------------------

- Removed lodash dependency, reducing overall package size
- Removed iternally rendered `<label>`, deprecating `labelText` prop


v1.0.0-rc2 - 31 Mar 2016
--------------------------------------

- Fixed a blocking issues for IE 11 users, detailed in #80
- Added `wrapperProps` and `wrapperStyle` props that are passed
to the `<Autocomplete />`'s root HTML wrapper. (via #91)


v1.0.0-rc1 - 31 Mar 2016
--------------------------------------

- Updated this component to no longer use internal state
for retaining value, this is prop driven now.
- The version number `1.0.0-rc1` is an unforunate coincidence,
We're only bumping this as it introduces breaking changes.
- Other outstanding PRs may be merged in to the the final
release so we can break several things at once (now that we
have tests of course)


v0.2.1 - 10 Mar 2016
--------------------------------------

- Added unit tests (thanks @ryanalane)
- Updated README.md

v0.1.4 - Wed, 12 Aug 2015 20:22:13 GMT
--------------------------------------

-


v0.1.3 - Wed, 12 Aug 2015 20:16:46 GMT
--------------------------------------

- [5306a64](../../commit/5306a64) [fixed] npm main entry


v0.1.2 - Wed, 12 Aug 2015 19:36:38 GMT
--------------------------------------

- [34b185b](../../commit/34b185b) [fixed] incorrect style merging


v0.1.1 - Wed, 12 Aug 2015 19:34:11 GMT
--------------------------------------

- [fd23644](../../commit/fd23644) [fixed] left-over console.log :|


v0.1.0 - Wed, 12 Aug 2015 19:22:26 GMT
--------------------------------------

-


