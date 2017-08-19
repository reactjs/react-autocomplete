# React Autocomplete [![Travis build status](https://travis-ci.org/reactjs/react-autocomplete.svg?branch=master)](https://travis-ci.org/reactjs/react-autocomplete/)

Accessible, extensible, Autocomplete for React.js.

```jsx
<Autocomplete
  getItemValue={(item) => item.label}
  items={[
    { label: 'apple' },
    { label: 'banana' },
    { label: 'pear' }
  ]}
  renderItem={(item, isHighlighted) =>
    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
      {item.label}
    </div>
  }
  value={value}
  onChange={(e) => value = e.target.value}
  onSelect={(val) => value = val}
/>
```

Check out [more examples](https://reactcommunity.org/react-autocomplete/) and get stuck right in with the [online editor](http://jsbin.com/mipesawapi/edit?js,output).

## Install

### npm

```bash
npm install --save react-autocomplete
```

### yarn

```bash
yarn add react-autocomplete
```

### AMD/UMD

* Development: [https://unpkg.com/react-autocomplete@${VERSION}/dist/react-autocomplete.js](https://unpkg.com/react-autocomplete@${VERSION}/dist/react-autocomplete.js)
* Production: [https://unpkg.com/react-autocomplete@${VERSION}/dist/react-autocomplete.min.js](https://unpkg.com/react-autocomplete@${VERSION}/dist/react-autocomplete.min.js)

## API

### Props

${API_DOC}
### Imperative API

In addition to the props there is an API available on the mounted element which is similar to that of `HTMLInputElement`. In other words: you can access most of the common `<input>` methods directly on an `Autocomplete` instance. An example:

```jsx
class MyComponent extends Component {
  componentDidMount() {
    // Focus the input and select "world"
    this.input.focus()
    this.input.setSelectionRange(6, 11)
  }
  render() {
    return (
      <Autocomplete
        ref={el => this.input = el}
        value="hello world"
        ...
      />
    )
  }
}
```

# Development
You can start a local development environment with `npm start`. This command starts a static file server on [localhost:8080](http://localhost:8080) which serves the examples in `examples/`. Hot-reload mechanisms are in place which means you don't have to refresh the page or restart the build for changes to take effect.

## Tests!

Run them:
`npm test`

Write them:
`lib/__tests__/Autocomplete-test.js`

Check your work:
`npm run coverage`

## Scripts
Run with `npm run <script>`.

### gh-pages
Builds the examples and assembles a commit which is pushed to `origin/gh-pages`, then cleans up your working directory. Note: This script will `git checkout master` before building.

### release
Takes the same argument as `npm publish`, i.e. `[major|minor|patch|x.x.x]`, then tags a new version, publishes, and pushes the version commit and tag to `origin/master`. Usage: `npm run release -- [major|minor|patch|x.x.x]`. Remember to update the CHANGELOG before releasing!

### build
Runs the build scripts detailed below.

### build:component
Transpiles the source in `lib/` and outputs it to `build/`, as well as creating a UMD bundle in `dist/`.

### build:examples
Creates bundles for each of the examples, which is used for pushing to `origin/gh-pages`.

### test
Runs the test scripts detailed below.

### test:lint
Runs `eslint` on the source.

### test:jest
Runs the unit tests with `jest`.

### coverage
Runs the unit tests and creates a code coverage report.

### start
Builds all the examples and starts a static file server on [localhost:8080](http://localhost:8080). Any changes made to `lib/Autocomplete.js` and the examples are automatically compiled and transmitted to the browser, i.e. there's no need to refresh the page or restart the build during development. This script is the perfect companion when making changes to this repo, since you can use the examples as a test-bed for development.
