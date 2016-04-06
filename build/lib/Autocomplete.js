'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var lodash = require('lodash');
var scrollIntoView = require('dom-scroll-into-view');

var _debugStates = [];

var Autocomplete = React.createClass({
  displayName: 'Autocomplete',

  propTypes: {
    value: React.PropTypes.any,
    onChange: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    shouldItemRender: React.PropTypes.func,
    renderItem: React.PropTypes.func.isRequired,
    menuStyle: React.PropTypes.object,
    inputProps: React.PropTypes.object,
    labelText: React.PropTypes.string,
    wrapperProps: React.PropTypes.object,
    wrapperStyle: React.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      value: '',
      wrapperProps: {},
      wrapperStyle: {
        display: 'inline-block'
      },
      inputProps: {},
      labelText: '',
      onChange: function onChange() {},
      onSelect: function onSelect(value, item) {},
      renderMenu: function renderMenu(items, value, style) {
        return React.createElement('div', { style: _extends({}, style, this.menuStyle), children: items });
      },
      shouldItemRender: function shouldItemRender() {
        return true;
      },
      menuStyle: {
        borderRadius: '3px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 0',
        fontSize: '90%',
        position: 'fixed',
        overflow: 'auto',
        maxHeight: '50%' }
    };
  },

  // TODO: don't cheat, let it flow to the bottom
  getInitialState: function getInitialState() {
    return {
      isOpen: false,
      highlightedIndex: null
    };
  },

  componentWillMount: function componentWillMount() {
    this.id = lodash.uniqueId('autocomplete-');
    this._ignoreBlur = false;
    this._performAutoCompleteOnUpdate = false;
    this._performAutoCompleteOnKeyUp = false;
  },

  componentWillReceiveProps: function componentWillReceiveProps() {
    this._performAutoCompleteOnUpdate = true;
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen === true && prevState.isOpen === false) this.setMenuPositions();

    if (this.state.isOpen && this._performAutoCompleteOnUpdate) {
      this._performAutoCompleteOnUpdate = false;
      this.maybeAutoCompleteText();
    }

    this.maybeScrollItemIntoView();
  },

  maybeScrollItemIntoView: function maybeScrollItemIntoView() {
    if (this.state.isOpen === true && this.state.highlightedIndex !== null) {
      var itemNode = this.refs['item-' + this.state.highlightedIndex];
      var menuNode = this.refs.menu;
      scrollIntoView(itemNode, menuNode, { onlyScrollIfNeeded: true });
    }
  },

  handleKeyDown: function handleKeyDown(event) {
    var _this = this;

    if (this.keyDownHandlers[event.key]) this.keyDownHandlers[event.key].call(this, event);else {
      var _ret = (function () {
        var _event$target = event.target;
        var selectionStart = _event$target.selectionStart;
        var value = _event$target.value;

        if (value === _this.state.value)
          // Nothing changed, no need to do anything. This also prevents
          // our workaround below from nuking user-made selections
          return {
            v: undefined
          };
        _this.setState({
          highlightedIndex: null,
          isOpen: true
        }, function () {
          // Restore caret position before autocompletion process
          // to work around a setSelectionRange bug in IE (#80)
          _this.refs.input.selectionStart = selectionStart;
        });
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  },

  handleChange: function handleChange(event) {
    this._performAutoCompleteOnKeyUp = true;
    this.props.onChange(event, event.target.value);
  },

  handleKeyUp: function handleKeyUp() {
    if (this._performAutoCompleteOnKeyUp) {
      this._performAutoCompleteOnKeyUp = false;
      this.maybeAutoCompleteText();
    }
  },

  keyDownHandlers: {
    ArrowDown: function ArrowDown(event) {
      event.preventDefault();
      var highlightedIndex = this.state.highlightedIndex;

      var index = highlightedIndex === null || highlightedIndex === this.getFilteredItems().length - 1 ? 0 : highlightedIndex + 1;
      this._performAutoCompleteOnKeyUp = true;
      this.setState({
        highlightedIndex: index,
        isOpen: true
      });
    },

    ArrowUp: function ArrowUp(event) {
      event.preventDefault();
      var highlightedIndex = this.state.highlightedIndex;

      var index = highlightedIndex === 0 || highlightedIndex === null ? this.getFilteredItems().length - 1 : highlightedIndex - 1;
      this._performAutoCompleteOnKeyUp = true;
      this.setState({
        highlightedIndex: index,
        isOpen: true
      });
    },

    Enter: function Enter(event) {
      var _this2 = this;

      if (this.state.isOpen === false) {
        // menu is closed so there is no selection to accept -> do nothing
        return;
      } else if (this.state.highlightedIndex == null) {
        // input has focus but no menu item is selected + enter is hit -> close the menu, highlight whatever's in input
        this.setState({
          isOpen: false
        }, function () {
          _this2.refs.input.select();
        });
      } else {
        // text entered + menu item has been highlighted + enter is hit -> update value to that of selected menu item, close the menu
        var item = this.getFilteredItems()[this.state.highlightedIndex];
        var value = this.props.getItemValue(item);
        this.setState({
          isOpen: false,
          highlightedIndex: null
        }, function () {
          //this.refs.input.focus() // TODO: file issue
          _this2.refs.input.setSelectionRange(value.length, value.length);
          _this2.props.onSelect(value, item);
        });
      }
    },

    Escape: function Escape(event) {
      this.setState({
        highlightedIndex: null,
        isOpen: false
      });
    }
  },

  getFilteredItems: function getFilteredItems() {
    var _this3 = this;

    var items = this.props.items;

    if (this.props.shouldItemRender) {
      items = items.filter(function (item) {
        return _this3.props.shouldItemRender(item, _this3.props.value);
      });
    }

    if (this.props.sortItems) {
      items.sort(function (a, b) {
        return _this3.props.sortItems(a, b, _this3.props.value);
      });
    }

    return items;
  },

  maybeAutoCompleteText: function maybeAutoCompleteText() {
    var _this4 = this;

    if (this.props.value === '') return;
    var highlightedIndex = this.state.highlightedIndex;

    var items = this.getFilteredItems();
    if (items.length === 0) return;
    var matchedItem = highlightedIndex !== null ? items[highlightedIndex] : items[0];
    var itemValue = this.props.getItemValue(matchedItem);
    var itemValueDoesMatch = itemValue.toLowerCase().indexOf(this.props.value.toLowerCase()) === 0;
    if (itemValueDoesMatch) {
      var node = this.refs.input;
      var setSelection = function setSelection() {
        node.value = itemValue;
        node.setSelectionRange(_this4.props.value.length, itemValue.length);
      };
      if (highlightedIndex === null) this.setState({ highlightedIndex: 0 }, setSelection);else setSelection();
    }
  },

  setMenuPositions: function setMenuPositions() {
    var node = this.refs.input;
    var rect = node.getBoundingClientRect();
    var computedStyle = global.window.getComputedStyle(node);
    var marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
    var marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
    var marginRight = parseInt(computedStyle.marginRight, 10) || 0;
    this.setState({
      menuTop: rect.bottom + marginBottom,
      menuLeft: rect.left + marginLeft,
      menuWidth: rect.width + marginLeft + marginRight
    });
  },

  highlightItemFromMouse: function highlightItemFromMouse(index) {
    this.setState({ highlightedIndex: index });
  },

  selectItemFromMouse: function selectItemFromMouse(item) {
    var _this5 = this;

    var value = this.props.getItemValue(item);
    this.setState({
      isOpen: false,
      highlightedIndex: null
    }, function () {
      _this5.props.onSelect(value, item);
      _this5.refs.input.focus();
      _this5.setIgnoreBlur(false);
    });
  },

  setIgnoreBlur: function setIgnoreBlur(ignore) {
    this._ignoreBlur = ignore;
  },

  renderMenu: function renderMenu() {
    var _this6 = this;

    var items = this.getFilteredItems().map(function (item, index) {
      var element = _this6.props.renderItem(item, _this6.state.highlightedIndex === index, { cursor: 'default' });
      return React.cloneElement(element, {
        onMouseDown: function onMouseDown() {
          return _this6.setIgnoreBlur(true);
        },
        onMouseEnter: function onMouseEnter() {
          return _this6.highlightItemFromMouse(index);
        },
        onClick: function onClick() {
          return _this6.selectItemFromMouse(item);
        },
        ref: 'item-' + index
      });
    });
    var style = {
      left: this.state.menuLeft,
      top: this.state.menuTop,
      minWidth: this.state.menuWidth
    };
    var menu = this.props.renderMenu(items, this.props.value, style);
    return React.cloneElement(menu, { ref: 'menu' });
  },

  handleInputBlur: function handleInputBlur() {
    if (this._ignoreBlur) return;
    this.setState({
      isOpen: false,
      highlightedIndex: null
    });
  },

  handleInputFocus: function handleInputFocus() {
    if (this._ignoreBlur) return;
    this.setState({ isOpen: true });
  },

  handleInputClick: function handleInputClick() {
    if (this.state.isOpen === false) this.setState({ isOpen: true });
  },

  render: function render() {
    var _this7 = this;

    if (this.props.debug) {
      // you don't like it, you love it
      _debugStates.push({
        id: _debugStates.length,
        state: this.state
      });
    }
    return React.createElement(
      'div',
      _extends({ style: _extends({}, this.props.wrapperStyle) }, this.props.wrapperProps),
      React.createElement(
        'label',
        { htmlFor: this.id, ref: 'label' },
        this.props.labelText
      ),
      React.createElement('input', _extends({}, this.props.inputProps, {
        role: 'combobox',
        'aria-autocomplete': 'both',
        ref: 'input',
        onFocus: this.handleInputFocus,
        onBlur: this.handleInputBlur,
        onChange: function (event) {
          return _this7.handleChange(event);
        },
        onKeyDown: function (event) {
          return _this7.handleKeyDown(event);
        },
        onKeyUp: function (event) {
          return _this7.handleKeyUp(event);
        },
        onClick: this.handleInputClick,
        value: this.props.value,
        id: this.id
      })),
      this.state.isOpen && this.renderMenu(),
      this.props.debug && React.createElement(
        'pre',
        { style: { marginLeft: 300 } },
        JSON.stringify(_debugStates.slice(_debugStates.length - 5, _debugStates.length), null, 2)
      )
    );
  }
});

module.exports = Autocomplete;