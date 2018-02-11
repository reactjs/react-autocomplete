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

* Development: [https://unpkg.com/react-autocomplete@1.8.1/dist/react-autocomplete.js](https://unpkg.com/react-autocomplete@1.8.1/dist/react-autocomplete.js)
* Production: [https://unpkg.com/react-autocomplete@1.8.1/dist/react-autocomplete.min.js](https://unpkg.com/react-autocomplete@1.8.1/dist/react-autocomplete.min.js)

## API

### Props

#### `getItemValue: Function`
Arguments: `item: Any`

Used to read the display value from each entry in `items`.

#### `items: Array`
The items to display in the dropdown menu

#### `renderItem: Function`
Arguments: `item: Any, isHighlighted: Boolean, styles: Object`

Invoked for each entry in `items` that also passes `shouldItemRender` to
generate the render tree for each item in the dropdown menu. `styles` is
an optional set of styles that can be applied to improve the look/feel
of the items in the dropdown menu.

#### `autoHighlight: Boolean` (optional)
Default value: `true`

Whether or not to automatically highlight the top match in the dropdown
menu.

#### `inputProps: Object` (optional)
Default value: `{}`

Props passed to `props.renderInput`. By default these props will be
applied to the `<input />` element rendered by `Autocomplete`, unless you
have specified a custom value for `props.renderInput`. Any properties
supported by `HTMLInputElement` can be specified, apart from the
following which are set by `Autocomplete`: value, autoComplete, role,
aria-autocomplete. `inputProps` is commonly used for (but not limited to)
placeholder, event handlers (onFocus, onBlur, etc.), autoFocus, etc..

#### `isItemSelectable: Function` (optional)
Default value: `function() { return true }`

Arguments: `item: Any`

Invoked when attempting to select an item. The return value is used to
determine whether the item should be selectable or not.
By default all items are selectable.

#### `menuStyle: Object` (optional)
Default value:
```jsx
{
  borderRadius: '3px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.9)',
  padding: '2px 0',
  fontSize: '90%',
  position: 'fixed',
  overflow: 'auto',
  maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
}
```

Styles that are applied to the dropdown menu in the default `renderMenu`
implementation. If you override `renderMenu` and you want to use
`menuStyle` you must manually apply them (`this.props.menuStyle`).

#### `onChange: Function` (optional)
Default value: `function() {}`

Arguments: `event: Event, value: String`

Invoked every time the user changes the input's value.

#### `onMenuVisibilityChange: Function` (optional)
Default value: `function() {}`

Arguments: `isOpen: Boolean`

Invoked every time the dropdown menu's visibility changes (i.e. every
time it is displayed/hidden).

#### `onSelect: Function` (optional)
Default value: `function() {}`

Arguments: `value: String, item: Any`

Invoked when the user selects an item from the dropdown menu.

#### `open: Boolean` (optional)
Used to override the internal logic which displays/hides the dropdown
menu. This is useful if you want to force a certain state based on your
UX/business logic. Use it together with `onMenuVisibilityChange` for
fine-grained control over the dropdown menu dynamics.

#### `renderInput: Function` (optional)
Default value:
```jsx
function(props) {
  return <input {...props} />
}
```

Arguments: `props: Object`

Invoked to generate the input element. The `props` argument is the result
of merging `props.inputProps` with a selection of props that are required
both for functionality and accessibility. At the very least you need to
apply `props.ref` and all `props.on<event>` event handlers. Failing to do
this will cause `Autocomplete` to behave unexpectedly.

#### `renderMenu: Function` (optional)
Default value:
```jsx
function(items, value, style) {
  return <div style={{ ...style, ...this.menuStyle }} children={items}/>
}
```

Arguments: `items: Array<Any>, value: String, styles: Object`

Invoked to generate the render tree for the dropdown menu. Ensure the
returned tree includes every entry in `items` or else the highlight order
and keyboard navigation logic will break. `styles` will contain
{ top, left, minWidth } which are the coordinates of the top-left corner
and the width of the dropdown menu.

#### `selectOnBlur: Boolean` (optional)
Default value: `false`

Whether or not to automatically select the highlighted item when the
`<input>` loses focus.

#### `shouldItemRender: Function` (optional)
Arguments: `item: Any, value: String`

Invoked for each entry in `items` and its return value is used to
determine whether or not it should be displayed in the dropdown menu.
By default all items are always rendered.

#### `sortItems: Function` (optional)
Arguments: `itemA: Any, itemB: Any, value: String`

The function which is used to sort `items` before display.

#### `value: Any` (optional)
Default value: `''`

The value to display in the input field

#### `wrapperProps: Object` (optional)
Default value: `{}`

Props that are applied to the element which wraps the `<input />` and
dropdown menu elements rendered by `Autocomplete`.

#### `wrapperStyle: Object` (optional)
Default value:
```jsx
{
  display: 'inline-block'
}
```

This is a shorthand for `wrapperProps={{ style: <your styles> }}`.
Note that `wrapperStyle` is applied before `wrapperProps`, so the latter
will win if it contains a `style` entry.


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
