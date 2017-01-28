# React Autocomplete [![Travis build status](https://travis-ci.org/reactjs/react-autocomplete.svg?branch=master)](https://travis-ci.org/reactjs/react-autocomplete/)

Accessible, extensible, Autocomplete for React.js.

[Examples](https://reactcommunity.org/react-autocomplete/)

## API

### `getItemValue: Function`
Arguments: `item: Any`

Used to read the display value from each entry in `items`.

### `items: Array`
The items to display in the dropdown menu

### `renderItem: Function`
Arguments: `item: Any, isHighlighted: Boolean, styles: Object`

Invoked for each entry in `items` that also passes `shouldItemRender` to
generate the render tree for each item in the dropdown menu. `styles` is
an optional set of styles that can be applied to improve the look/feel
of the items in the dropdown menu.

### `autoHighlight: Boolean` (optional)
Default value: `true`

Whether or not to automatically highlight the top match in the dropdown
menu.

### `inputProps: Object` (optional)
Default value: `{}`

Props that are applied to the `<input />` element rendered by
`Autocomplete`. Any properties supported by `HTMLInputElement` can be
specified, apart from the following which are set by `Autocomplete`:
value, autoComplete, role, aria-autocomplete

### `menuStyle: Object` (optional)
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
`menuStyles` you must manually apply them (`this.props.menuStyles`).

### `onChange: Function` (optional)
Default value: `function() {}`

Arguments: `event: Event, value: String`

Invoked every time the user changes the input's value.

### `onMenuVisibilityChange: Function` (optional)
Default value: `function() {}`

Arguments: `isOpen: Boolean`

Invoked every time the dropdown menu's visibility changes (i.e. every
time it is displayed/hidden).

### `onSelect: Function` (optional)
Default value: `function() {}`

Arguments: `value: String, item: Any`

Invoked when the user selects an item from the dropdown menu.

### `open: Boolean` (optional)
Used to override the internal logic which displays/hides the dropdown
menu. This is useful if you want to force a certain state based on your
UX/business logic. Use it together with `onMenuVisibilityChange` for
fine-grained control over the dropdown menu dynamics.

### `renderMenu: Function` (optional)
Default value:
```jsx
function(items, value, style) {
  return <div style={{...style, ...this.menuStyle}} children={items}/>
}
```

Arguments: `items: Array<Any>, value: String, styles: Object`

Invoked to generate the render tree for the dropdown menu. Ensure the
returned tree includes `items` or else no items will be rendered.
`styles` will contain { top, left, minWidth } which are the coordinates
of the top-left corner and the width of the dropdown menu.

### `shouldItemRender: Function` (optional)
Arguments: `item: Any, value: String`

Invoked for each entry in `items` and its return value is used to
determine whether or not it should be displayed in the dropdown menu.
By default all items are always rendered.

### `sortItems: Function` (optional)
Arguments: `itemA: Any, itemB: Any, value: String`

The function which is used to sort `items` before display.

### `value: Any` (optional)
Default value: `''`

The value to display in the input field

### `wrapperProps: Object` (optional)
Default value: `{}`

Props that are applied to the element which wraps the `<input />` and
dropdown menu elements rendered by `Autocomplete`.

### `wrapperStyle: Object` (optional)
Default value:
```jsx
{
  display: 'inline-block'
}
```

This is a shorthand for `wrapperProps={{ style: <your styles> }}`.
Note that `wrapperStyle` is applied before `wrapperProps`, so the latter
will win if it contains a `style` entry.



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
