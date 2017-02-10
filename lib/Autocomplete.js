const React = require('react')
const { findDOMNode } = require('react-dom')
const scrollIntoView = require('dom-scroll-into-view')

const Autocomplete = React.createClass({

  propTypes: {
    /**
     * The items to display in the dropdown menu
     */
    items: React.PropTypes.array.isRequired,
    /**
     * Arguments: `event: Event, item: Any`
     *
     * Invoked when the user selects an item from the dropdown menu.
     */
    onSelect: React.PropTypes.func,
    /**
     * Arguments: `item: Any, isHighlighted: Boolean, index: Number`
     *
     * Invoked for each entry in `items` to generate the render tree for each
     * item in the dropdown menu.
     */
    children: React.PropTypes.func.isRequired,
    /**
     * Arguments: `item: Any, value: String`
     *
     * Invoked for each entry in `items` to find the first item that should be
     * highlighted. Once this function returns `true` no further invokations
     * will happen until the next render pass.
     */
    shouldHighlightItem: React.PropTypes.func,
    /**
     * Arguments: `items: Array<Any>, value: String, isOpen: Boolean`
     *
     * Invoked to generate the render tree for the dropdown menu. Ensure the
     * returned tree includes `items` or else no items will be rendered.
     * `styles` will contain { top, left, minWidth } which are the coordinates
     * of the top-left corner and the width of the dropdown menu.
     */
    renderMenu: React.PropTypes.func,
    /**
     * Props that are applied to the element which wraps the `<input />` and
     * dropdown menu elements rendered by `Autocomplete`.
     */
    wrapperProps: React.PropTypes.object,
    /**
     * Arguments: `isOpen: Boolean`
     *
     * Invoked every time the dropdown menu's visibility changes (i.e. every
     * time it is displayed/hidden).
     */
    onMenuVisibilityChange: React.PropTypes.func,
    /**
     * Used to override the internal logic which displays/hides the dropdown
     * menu. This is useful if you want to force a certain state based on your
     * UX/business logic. Use it together with `onMenuVisibilityChange` for
     * fine-grained control over the dropdown menu dynamics.
     */
    open: React.PropTypes.bool,
    debug: React.PropTypes.bool,
  },

  getDefaultProps () {
    return {
      wrapperProps: {
        style: {
          display: 'inline-block',
        },
      },
      onSelect (event, item) {}, // TODO
      renderMenu (items, value, isOpen) {
        return isOpen ? <div>{items}</div> : null
      },
      onMenuVisibilityChange () {},
      shouldHighlightItem () { return false },
    }
  },

  getInitialState () {
    return {
      isOpen: false,
      highlightedIndex: null,
    }
  },

  componentWillMount () {
    this._debugStates = []
    this._ignoreBlur = false
    this._performHighlightOnUpdate = false
  },

  componentDidUpdate (prevProps, prevState) {
    if (this._performHighlightOnUpdate) {
      this._performHighlightOnUpdate = false
      this.findHighlightedIndex(this.props)
    }
    this.maybeScrollItemIntoView()
    if (prevState.isOpen !== this.state.isOpen) {
      this.props.onMenuVisibilityChange(this.state.isOpen)
    }
  },

  isOpen () {
    return this.state.isOpen === true || ('open' in this.props && this.props.open);
  },

  maybeScrollItemIntoView () {
    if (this.isOpen() && this.state.highlightedIndex !== null) {
      const itemNode = this.refs[`item-${this.state.highlightedIndex}`]
      const menuNode = this.refs.menu
      if (itemNode && menuNode) {
        scrollIntoView(
          findDOMNode(itemNode),
          findDOMNode(menuNode),
          { onlyScrollIfNeeded: true }
        )
      }
    }
  },

  handleKeyDown (event) {
    if (this.keyDownHandlers[event.key]) {
      this.keyDownHandlers[event.key].call(this, event)
    } else {
      this.setState({
        highlightedIndex: null,
        isOpen: true
      })
    }
  },

  handleChange () {
    this._performHighlightOnUpdate = true
  },

  keyDownHandlers: {
    ArrowDown (event) {
      event.preventDefault()
      const itemsLength = this.props.items.length
      if (!itemsLength) return
      const { highlightedIndex } = this.state
      const index = (
        highlightedIndex === null ||
        highlightedIndex === itemsLength - 1
      ) ? 0 : highlightedIndex + 1
      this.setState({
        highlightedIndex: index,
        isOpen: true,
      })
    },

    ArrowUp (event) {
      event.preventDefault()
      const itemsLength = this.props.items.length
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

    Enter (event) {
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
        const item = this.props.items[this.state.highlightedIndex]
        this.selectItem(event, item)
      }
    },

    Escape () {
      this.setState({
        highlightedIndex: null,
        isOpen: false
      })
    }
  },

  findHighlightedIndex (props) {
    let highlightedIndex = null
    if (props.shouldHighlightItem && props.value && props.items.length > 0) { // TODO: better value check
      for (let i = 0; i < props.items.length; i++) { // TODO
        if (props.shouldHighlightItem(props.items[i], props.value, i)) {
          highlightedIndex = i
          break;
        }
      }
    }
    if (this.state.highlightedIndex !== highlightedIndex) { // Prevent unnecessary re-renders
      this.setState({ highlightedIndex })
    }
  },

  highlightItemFromMouse (index) {
    this.setState({ highlightedIndex: index })
  },

  selectItem (event, item) {
    this.setState({
      isOpen: false,
      highlightedIndex: null
    }, () => {
      this.props.onSelect(event, item)
      this.refs.input.focus()
    })
  },

  renderMenu () {
    const items = this.props.items.map((item, index) => {
      const element = this.props.children(
        item,
        this.state.highlightedIndex === index,
        index,
      )
      return React.cloneElement(element, {
        onMouseDown: () => this._ignoreBlur = true, // Ignore blur to prevent menu from de-rendering before we can process click
        onMouseEnter: () => this.highlightItemFromMouse(index),
        onClick: event => this.selectItem(event, item),
        ref: `item-${index}`,
      })
    })
    const menu = this.props.renderMenu(items, this.props.value, this.isOpen())
    return React.cloneElement(menu, { ref: 'menu' })
  },

  handleInputBlur () {
    if (!this._ignoreBlur) {
      this.setState({
        isOpen: false,
        highlightedIndex: null
      })
    }
  },

  handleInputFocus () {
    if (this._ignoreBlur) {
      // This happens when the user selects and item from the menu
      this._ignoreBlur = false
    } else {
      this._performHighlightOnUpdate = true
      this.setState({ isOpen: true })
    }
  },

  composeEventHandlers (internal, external) {
    return external
      ? e => { internal(e); external(e); }
      : internal
  },

  render () {
    const {
        debug,
        open,
        onSelect,
        wrapperProps,
        onFocus,
        onBlur,
        onChange,
        onKeyDown,
        children,
        items,
        onMenuVisibilityChange,
        shouldHighlightItem,
        ...props,
    } = this.props
    if (debug) { // you don't like it, you love it
      this._debugStates.push({
        id: this._debugStates.length,
        state: this.state
      })
    }
    // TODO: Move highlight calulation here
    return (
      <div {...wrapperProps}>
        <input
          {...props}
          role="combobox"
          aria-autocomplete="list"
          autoComplete="off"
          ref="input"
          onFocus={this.composeEventHandlers(this.handleInputFocus, onFocus)}
          onBlur={this.composeEventHandlers(this.handleInputBlur, onBlur)}
          onChange={this.composeEventHandlers(this.handleChange, onChange)}
          onKeyDown={this.composeEventHandlers(this.handleKeyDown, onKeyDown)}
        />
        {this.isOpen() && this.renderMenu()}
        {debug && (
          <pre style={{marginLeft: 300}}>
            {JSON.stringify(this._debugStates.slice(Math.max(0, this._debugStates.length - 5), this._debugStates.length), null, 2)}
          </pre>
        )}
      </div>
    )
  }
})

module.exports = Autocomplete

