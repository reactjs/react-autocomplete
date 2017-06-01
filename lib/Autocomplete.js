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
     * Arguments: `value: String, item: Any`
     *
     * Invoked when the user selects an item from the dropdown menu.
     */
    onSelect: PropTypes.func,
    /**
     * Arguments: `item: Any`
     *
     * Used to read the display value from each entry in `items`.
     */
    getItemValue: PropTypes.func.isRequired,
    /**
     * Arguments: `item: Any, isHighlighted: Boolean, styles: Object`
     *
     * Invoked for each entry in `items` to generate the render tree for each
     * item in the dropdown menu. `styles` is an optional set of styles that
     * can be applied to improve the look/feel of the items in the dropdown menu.
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
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleInputClick = this.handleInputClick.bind(this)
  }

  componentWillMount() {
    // this.refs is frozen, so we need to assign a new object to it
    this.refs = {}
    this._ignoreBlur = false
    this._performAutoCompleteOnUpdate = false
    this._performAutoCompleteOnKeyUp = false
  }

  componentWillReceiveProps(nextProps) {
    this._performAutoCompleteOnUpdate = true
    // If `items` has changed we want to reset `highlightedIndex`
    // since it probably no longer refers to a relevant item
    if (this.props.items !== nextProps.items ||
      // The entries in `items` may have been changed even though the
      // object reference remains the same, double check by seeing
      // if `highlightedIndex` points to an existing item
      this.state.highlightedIndex >= nextProps.items.length) {
      this.setState({ highlightedIndex: null })
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

    if (this.isOpen() && this._performAutoCompleteOnUpdate) {
      this._performAutoCompleteOnUpdate = false
      this.maybeAutoCompleteText()
    }

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
    this._performAutoCompleteOnKeyUp = true
    this.setState({ highlightedIndex: null })
    const { onChange } = this.props
    if (onChange) {
      onChange(event)
    }
  }

  handleKeyUp() {
    if (this._performAutoCompleteOnKeyUp) {
      this._performAutoCompleteOnKeyUp = false
      this.maybeAutoCompleteText()
    }
  }

  static keyDownHandlers = {
    ArrowDown(event) {
      event.preventDefault()
      const itemsLength = this.items.length
      if (!itemsLength) return
      const { highlightedIndex } = this.state
      const index = (
        highlightedIndex === null ||
        highlightedIndex === itemsLength - 1
      ) ?  0 : highlightedIndex + 1
      this._performAutoCompleteOnKeyUp = true
      this.setState({
        highlightedIndex: index,
        isOpen: true,
      })
    },

    ArrowUp(event) {
      event.preventDefault()
      const itemsLength = this.items.length
      if (!itemsLength) return
      const { highlightedIndex } = this.state
      const index = (
        highlightedIndex === 0 ||
        highlightedIndex === null
      ) ? itemsLength - 1 : highlightedIndex - 1
      this._performAutoCompleteOnKeyUp = true
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
        const item = this.items[this.state.highlightedIndex]
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

  maybeAutoCompleteText() {
    if (!this.props.autoHighlight || this.props.value === '')
      return
    const { highlightedIndex } = this.state
    const items = this.items
    if (items.length === 0)
      return
    const matchedItem = highlightedIndex !== null ?
      items[highlightedIndex] : items[0]
    const itemValue = this.props.getItemValue(matchedItem)
    const itemValueDoesMatch = (itemValue.toLowerCase().indexOf(
      this.props.value.toLowerCase()
    ) === 0)
    if (itemValueDoesMatch && highlightedIndex === null)
      this.setState({ highlightedIndex: 0 })
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
    const items = this.items.map((item, index) => {
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
    const { onBlur } = this.props
    if (onBlur) {
      onBlur(event)
    }
  }

  handleInputFocus(event) {
    if (this._ignoreBlur) {
      return
    }
    this.setState({ isOpen: true })
    const { onFocus } = this.props
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
    const {
      items,
      value,
      onSelect,
      getItemValue,
      renderItem,
      renderMenu,
      menuStyle,
      autoHighlight,
      onMenuVisibilityChange,
      open,
      debug,
      ...inputProps,
    } = this.props
    if (debug) { // you don't like it, you love it
      this._debugStates.push({
        id: this._debugStates.length,
        state: this.state
      })
    }

    const open = this.isOpen()
    return [
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
        onKeyUp={this.composeEventHandlers(this.handleKeyUp, inputProps.onKeyUp)}
        onClick={this.composeEventHandlers(this.handleInputClick, inputProps.onClick)}
      />,
      open ? this.renderMenu() : null,
      this.props.debug && (
        <pre style={{ marginLeft: 300 }}>
          {JSON.stringify(this._debugStates.slice(this._debugStates.length - 5, this._debugStates.length), null, 2)}
        </pre>
      ),
    ]
  }
}

module.exports = Autocomplete

