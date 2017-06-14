const React = require('react')
const PropTypes = require('prop-types')
const { findDOMNode } = require('react-dom')
const scrollIntoView = require('dom-scroll-into-view')

const IMPERATIVE_API = [
  'blur',
  'checkValidity',
  'click',
  'focus',
  'select',
  'setCustomValidity',
  'setSelectionRange',
  'setRangeText',
]

class Autocomplete extends React.Component {

  static propTypes = {
    /**
     * The items to display in the dropdown menu
     */
    items: PropTypes.array.isRequired,
    /**
     * The value to display in the input field
     */
    value: PropTypes.any,
    /**
     * Arguments: `event: Event, value: String`
     *
     * Invoked every time the user changes the input's value.
     */
    onChange: PropTypes.func,
    /**
     * Arguments: `value: String, item: Any`
     *
     * Invoked when the user selects an item from the dropdown menu.
     */
    onSelect: PropTypes.func,
    /**
     * Arguments: `item: Any, value: String`
     *
     * Invoked for each entry in `items` and its return value is used to
     * determine whether or not it should be displayed in the dropdown menu.
     * By default all items are always rendered.
     */
    shouldItemRender: PropTypes.func,
    /**
     * Arguments: `itemA: Any, itemB: Any, value: String`
     *
     * The function which is used to sort `items` before display.
     */
    sortItems: PropTypes.func,
    /**
     * Arguments: `item: Any`
     *
     * Used to read the display value from each entry in `items`.
     */
    getItemValue: PropTypes.func.isRequired,
    /**
     * Arguments: `item: Any, isHighlighted: Boolean, styles: Object`
     *
     * Invoked for each entry in `items` that also passes `shouldItemRender` to
     * generate the render tree for each item in the dropdown menu. `styles` is
     * an optional set of styles that can be applied to improve the look/feel
     * of the items in the dropdown menu.
     */
    renderItem: PropTypes.func.isRequired,
    /**
     * Arguments: `items: Array<Any>, value: String, styles: Object`
     *
     * Invoked to generate the render tree for the dropdown menu. Ensure the
     * returned tree includes `items` or else no items will be rendered.
     * `styles` will contain { top, left, minWidth } which are the coordinates
     * of the top-left corner and the width of the dropdown menu.
     */
    renderMenu: PropTypes.func,
    /**
     * Styles that are applied to the dropdown menu in the default `renderMenu`
     * implementation. If you override `renderMenu` and you want to use
     * `menuStyles` you must manually apply them (`this.props.menuStyles`).
     */
    menuStyle: PropTypes.object,
    /**
     * Props that are applied to the `<input />` element rendered by
     * `Autocomplete`. Any properties supported by `HTMLInputElement` can be
     * specified, apart from the following which are set by `Autocomplete`:
     * value, autoComplete, role, aria-autocomplete
     */
    inputProps: PropTypes.object,
    /**
     * Props that are applied to the element which wraps the `<input />` and
     * dropdown menu elements rendered by `Autocomplete`.
     */
    wrapperProps: PropTypes.object,
    /**
     * This is a shorthand for `wrapperProps={{ style: <your styles> }}`.
     * Note that `wrapperStyle` is applied before `wrapperProps`, so the latter
     * will win if it contains a `style` entry.
     */
    wrapperStyle: PropTypes.object,
    /**
     * Whether or not to automatically highlight the top match in the dropdown
     * menu.
     */
    autoHighlight: PropTypes.bool,
    /**
     * Arguments: `isOpen: Boolean`
     *
     * Invoked every time the dropdown menu's visibility changes (i.e. every
     * time it is displayed/hidden).
     */
    onMenuVisibilityChange: PropTypes.func,
    /**
     * Used to override the internal logic which displays/hides the dropdown
     * menu. This is useful if you want to force a certain state based on your
     * UX/business logic. Use it together with `onMenuVisibilityChange` for
     * fine-grained control over the dropdown menu dynamics.
     */
    open: PropTypes.bool,
    debug: PropTypes.bool,
  }

  static defaultProps = {
    value: '',
    wrapperProps: {},
    wrapperStyle: {
      display: 'inline-block'
    },
    inputProps: {},
    onChange() {},
    onSelect() {},
    renderMenu(items, value, style) {
      return <div style={{ ...style, ...this.menuStyle }} children={items}/>
    },
    menuStyle: {
      borderRadius: '3px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '2px 0',
      fontSize: '90%',
      position: 'fixed',
      overflow: 'auto',
      maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
    },
    autoHighlight: true,
    onMenuVisibilityChange() {},
  }

  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      highlightedIndex: null,
    }
    this._debugStates = []
    this.exposeAPI = this.exposeAPI.bind(this)
    this.handleInputFocus = this.handleInputFocus.bind(this)
    this.handleInputBlur = this.handleInputBlur.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleInputClick = this.handleInputClick.bind(this)
  }

  componentWillMount() {
    // this.refs is frozen, so we need to assign a new object to it
    this.refs = {}
    this._ignoreBlur = false
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.highlightedIndex !== null) {
      this.setState(this.ensureHighlightedIndex)
    }
    if (nextProps.autoHighlight && this.props.value !== nextProps.value) {
      this.setState(this.maybeAutoCompleteText)
    }
  }

  componentDidMount() {
    if (this.isOpen()) {
      this.setMenuPositions()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if ((this.state.isOpen && !prevState.isOpen) || ('open' in this.props && this.props.open && !prevProps.open))
      this.setMenuPositions()

    this.maybeScrollItemIntoView()
    if (prevState.isOpen !== this.state.isOpen) {
      this.props.onMenuVisibilityChange(this.state.isOpen)
    }
    // Capture the input's focus as long as the ignoreBlur flag is set
    if (this._ignoreBlur) {
      this.refs.input.focus()
    }
  }

  exposeAPI(el) {
    this.refs.input = el
    IMPERATIVE_API.forEach(ev => this[ev] = (el && el[ev] && el[ev].bind(el)))
  }

  maybeScrollItemIntoView() {
    if (this.isOpen() && this.state.highlightedIndex !== null) {
      const itemNode = this.refs[`item-${this.state.highlightedIndex}`]
      const menuNode = this.refs.menu
      if(itemNode) {
        scrollIntoView(
          findDOMNode(itemNode),
          findDOMNode(menuNode),
          { onlyScrollIfNeeded: true }
        )
      }
    }
  }

  handleKeyDown(event) {
    if (Autocomplete.keyDownHandlers[event.key])
      Autocomplete.keyDownHandlers[event.key].call(this, event)
    else if (!this.isOpen()) {
      this.setState({
        isOpen: true
      })
    }
  }

  handleChange(event) {
    this.props.onChange(event, event.target.value)
  }

  static keyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      const itemsLength = this.getFilteredItems(this.props).length
      if (!itemsLength) return
      const { highlightedIndex } = this.state
      const index = (
        highlightedIndex === null ||
        highlightedIndex === itemsLength - 1
      ) ?  0 : highlightedIndex + 1
      this.setState({
        highlightedIndex: index,
        isOpen: true,
      })
    },

    ArrowUp(event) {
      event.preventDefault()
      const itemsLength = this.getFilteredItems(this.props).length
      if (!itemsLength) return
      const { highlightedIndex } = this.state
      const index = (
        highlightedIndex === 0 ||
        highlightedIndex === null
      ) ? itemsLength - 1 : highlightedIndex - 1
      this.setState({
        highlightedIndex: index,
        isOpen: true,
      })
    },

    Enter(event) {
      if (!this.isOpen()) {
        // menu is closed so there is no selection to accept -> do nothing
        return
      }
      else if (this.state.highlightedIndex == null) {
        // input has focus but no menu item is selected + enter is hit -> close the menu, highlight whatever's in input
        this.setState({
          isOpen: false
        }, () => {
          this.refs.input.select()
        })
      }
      else {
        // text entered + menu item has been highlighted + enter is hit -> update value to that of selected menu item, close the menu
        event.preventDefault()
        const item = this.getFilteredItems(this.props)[this.state.highlightedIndex]
        const value = this.props.getItemValue(item)
        this.setState({
          isOpen: false,
          highlightedIndex: null
        }, () => {
          //this.refs.input.focus() // TODO: file issue
          this.refs.input.setSelectionRange(
            value.length,
            value.length
          )
          this.props.onSelect(value, item)
        })
      }
    },

    Escape() {
      // In case the user is currently hovering over the menu
      this.setIgnoreBlur(false)
      this.setState({
        highlightedIndex: null,
        isOpen: false
      })
    },

    Tab() {
      // In case the user is currently hovering over the menu
      this.setIgnoreBlur(false)
    },
  }

  getFilteredItems(props) {
    let items = props.items

    if (props.shouldItemRender) {
      items = items.filter((item) => (
        props.shouldItemRender(item, props.value)
      ))
    }

    if (props.sortItems) {
      items.sort((a, b) => (
        props.sortItems(a, b, props.value)
      ))
    }

    return items
  }

  maybeAutoCompleteText(state, props) {
    const { highlightedIndex } = state
    const { value, getItemValue } = props
    const index = highlightedIndex === null ? 0 : highlightedIndex
    const matchedItem = this.getFilteredItems(props)[index]
    if (value !== '' && matchedItem) {
      const itemValue = getItemValue(matchedItem)
      const itemValueDoesMatch = (itemValue.toLowerCase().indexOf(
        value.toLowerCase()
      ) === 0)
      if (itemValueDoesMatch) {
        return { highlightedIndex: index }
      }
    }
    return { highlightedIndex: null }
  }

  ensureHighlightedIndex(state, props) {
    if (state.highlightedIndex >= this.getFilteredItems(props).length) {
      return { highlightedIndex: null }
    }
  }

  setMenuPositions() {
    const node = this.refs.input
    const rect = node.getBoundingClientRect()
    const computedStyle = global.window.getComputedStyle(node)
    const marginBottom = parseInt(computedStyle.marginBottom, 10) || 0
    const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0
    const marginRight = parseInt(computedStyle.marginRight, 10) || 0
    this.setState({
      menuTop: rect.bottom + marginBottom,
      menuLeft: rect.left + marginLeft,
      menuWidth: rect.width + marginLeft + marginRight
    })
  }

  highlightItemFromMouse(index) {
    this.setState({ highlightedIndex: index })
  }

  selectItemFromMouse(item) {
    const value = this.props.getItemValue(item)
    this.setState({
      isOpen: false,
      highlightedIndex: null
    }, () => {
      // Clear the ignoreBlur flag after the component has
      // updated to release control over the input's focus
      this.setIgnoreBlur(false)
      this.props.onSelect(value, item)
    })
  }

  setIgnoreBlur(ignore) {
    this._ignoreBlur = ignore
  }

  renderMenu() {
    const items = this.getFilteredItems(this.props).map((item, index) => {
      const element = this.props.renderItem(
        item,
        this.state.highlightedIndex === index,
        { cursor: 'default' }
      )
      return React.cloneElement(element, {
        onMouseEnter: () => this.highlightItemFromMouse(index),
        onClick: () => this.selectItemFromMouse(item),
        ref: e => this.refs[`item-${index}`] = e,
      })
    })
    const style = {
      left: this.state.menuLeft,
      top: this.state.menuTop,
      minWidth: this.state.menuWidth,
    }
    const menu = this.props.renderMenu(items, this.props.value, style)
    return React.cloneElement(menu, {
      ref: e => this.refs.menu = e,
      // Ignore blur to prevent menu from de-rendering before we can process click
      onMouseEnter: () => this.setIgnoreBlur(true),
      onMouseLeave: () => this.setIgnoreBlur(false),
    })
  }

  handleInputBlur(event) {
    if (this._ignoreBlur) {
      return
    }
    this.setState({
      isOpen: false,
      highlightedIndex: null
    })
    const { onBlur } = this.props.inputProps
    if (onBlur) {
      onBlur(event)
    }
  }

  handleInputFocus(event) {
    if (this._ignoreBlur) {
      return
    }
    this.setState({ isOpen: true })
    const { onFocus } = this.props.inputProps
    if (onFocus) {
      onFocus(event)
    }
  }

  isInputFocused() {
    const el = this.refs.input
    return el.ownerDocument && (el === el.ownerDocument.activeElement)
  }

  handleInputClick() {
    // Input will not be focused if it's disabled
    if (this.isInputFocused() && !this.isOpen())
      this.setState({ isOpen: true })
  }

  composeEventHandlers(internal, external) {
    return external
      ? e => { internal(e); external(e) }
      : internal
  }

  isOpen() {
    return 'open' in this.props ? this.props.open : this.state.isOpen
  }

  render() {
    if (this.props.debug) { // you don't like it, you love it
      this._debugStates.push({
        id: this._debugStates.length,
        state: this.state
      })
    }

    const { inputProps } = this.props
    const open = this.isOpen()
    return (
      <div style={{ ...this.props.wrapperStyle }} {...this.props.wrapperProps}>
        <input
          {...inputProps}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          ref={this.exposeAPI}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onChange={this.handleChange}
          onKeyDown={this.composeEventHandlers(this.handleKeyDown, inputProps.onKeyDown)}
          onClick={this.composeEventHandlers(this.handleInputClick, inputProps.onClick)}
          value={this.props.value}
        />
        {open && this.renderMenu()}
        {this.props.debug && (
          <pre style={{ marginLeft: 300 }}>
            {JSON.stringify(this._debugStates.slice(Math.max(0, this._debugStates.length - 5), this._debugStates.length), null, 2)}
          </pre>
        )}
      </div>
    )
  }
}

module.exports = Autocomplete

