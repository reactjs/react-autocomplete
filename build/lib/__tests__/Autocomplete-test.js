'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _Autocomplete = require('../Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

var _utils = require('../utils');

jest.unmock('../Autocomplete');
jest.unmock('../utils');

function AutocompleteComponentJSX(extraProps) {
  return _react2['default'].createElement(_Autocomplete2['default'], _extends({
    labelText: 'Choose a state from the US',
    inputProps: { name: "US state" },
    getItemValue: function (item) {
      return item.name;
    },
    items: (0, _utils.getStates)(),
    renderItem: function (item, isHighlighted) {
      return _react2['default'].createElement(
        'div',
        {
          style: isHighlighted ? _utils.styles.highlightedItem : _utils.styles.item,
          key: item.abbr
        },
        item.name
      );
    },
    shouldItemRender: _utils.matchStateToTerm
  }, extraProps));
};

describe('Autocomplete acceptance tests', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should display autocomplete menu when input has focus', function () {

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.instance().refs.menu).toBe(undefined);

    // Display autocomplete menu upon input focus
    autocompleteInputWrapper.simulate('focus');

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.instance().refs.menu).not.toBe(undefined);
  });

  it('should show results when value is a partial match', function () {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children().length).toBe(50);
    autocompleteWrapper.setProps({ value: 'Ar' });
    expect(autocompleteWrapper.ref('menu').children().length).toBe(6);
  });

  it('should close autocomplete menu when input is blurred', function () {

    autocompleteInputWrapper.simulate('blur');

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.instance().refs.menu).toBe(undefined);
  });

  it('should reset `highlightedIndex` when `items` changes', function () {
    autocompleteWrapper.setState({ highlightedIndex: 10 });
    autocompleteWrapper.setProps({ items: [] });
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });

  it('should reset `highlightedIndex` when it falls outside of possible `items` range', function () {
    var items = (0, _utils.getStates)();
    autocompleteWrapper.setProps({ items: items });
    autocompleteWrapper.setState({ highlightedIndex: 10 });
    items.length = 5;
    autocompleteWrapper.setProps({ items: items });
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });

  it('should display menu based on `props.open` when provided', function () {
    var tree = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
    expect(tree.state('isOpen')).toBe(false);
    expect(tree.find('> div').length).toBe(0);
    tree.setState({ isOpen: true });
    expect(tree.find('> div').length).toBe(1);
    tree.setProps({ open: false });
    tree.setState({ isOpen: false });
    expect(tree.find('> div').length).toBe(0);
    tree.setProps({ open: true });
    expect(tree.find('> div').length).toBe(1);
  });

  it('should invoke `props.inMenuVisibilityChange` when `state.isOpen` changes', function () {
    var onMenuVisibilityChange = jest.fn();
    var tree = (0, _enzyme.mount)(AutocompleteComponentJSX({ onMenuVisibilityChange: onMenuVisibilityChange }));
    expect(tree.state('isOpen')).toBe(false);
    expect(onMenuVisibilityChange.mock.calls.length).toBe(0);
    tree.setState({ isOpen: true });
    expect(onMenuVisibilityChange.mock.calls.length).toBe(1);
    expect(onMenuVisibilityChange.mock.calls[0][0]).toBe(true);
    tree.setState({ isOpen: false });
    expect(onMenuVisibilityChange.mock.calls.length).toBe(2);
    expect(onMenuVisibilityChange.mock.calls[1][0]).toBe(false);
  });

  it('should allow specifying any event handler via `props.inputProps`', function () {
    var handlers = ['Focus', 'Blur', 'KeyDown', 'KeyUp', 'Click'];
    var spies = [];
    var inputProps = {};
    handlers.forEach(function (handler, i) {
      return inputProps['on' + handler] = spies[i] = jest.fn();
    });
    var tree = (0, _enzyme.mount)(AutocompleteComponentJSX({ inputProps: inputProps }));
    handlers.forEach(function (handler, i) {
      tree.find('input').simulate(handler.toLowerCase());
      expect(spies[i].mock.calls.length).toBe(1, handler + ' handler was not called');
      expect(spies[i].mock.calls[0][0]).toBeDefined(handler + ' handler did not receive event');
    });
  });
});

// Event handler unit tests

describe('Autocomplete keyPress-><character> event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should pass updated `input.value` to `onChange` and replace with `props.value`', function (done) {

    var value = '';
    autocompleteWrapper.setProps({ value: value, onChange: function onChange(_, v) {
        value = v;
      } });

    autocompleteInputWrapper.get(0).value = 'a';
    autocompleteInputWrapper.simulate('keyPress', { key: 'a', keyCode: 97, which: 97 });
    autocompleteInputWrapper.simulate('change');

    expect(autocompleteInputWrapper.get(0).value).toEqual('');
    expect(value).toEqual('a');
    done();
  });

  it('should highlight top match', function () {
    var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteWrapper.setProps({ value: 'a' });
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
  });

  it('should not highlight top match when autoHighlight=false', function () {
    var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({
      autoHighlight: false
    }));
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteWrapper.setProps({ value: 'a' });
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(null);
  });
});

describe('Autocomplete kewDown->ArrowDown event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should highlight the 1st item in the menu when none is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });
    autocompleteWrapper.setState({ 'highlightedIndex': null });

    autocompleteInputWrapper.simulate('keyDown', { key: "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
  });

  it('should highlight the "n+1" item in the menu when "n" is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });

    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({ 'highlightedIndex': n });

    autocompleteInputWrapper.simulate('keyDown', { key: "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n + 1);
  });

  it('should highlight the 1st item in the menu when the last is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });

    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({ 'highlightedIndex': 49 });

    autocompleteInputWrapper.simulate('keyDown', { key: "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
  });
});

describe('Autocomplete kewDown->ArrowUp event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should highlight the last item in the menu when none is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });
    autocompleteWrapper.setState({ 'highlightedIndex': null });
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });

    autocompleteInputWrapper.simulate('keyDown', { key: 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49);
  });

  it('should highlight the "n-1" item in the menu when "n" is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });

    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({ 'highlightedIndex': n });

    autocompleteInputWrapper.simulate('keyDown', { key: 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n - 1);
  });

  it('should highlight the last item in the menu when the 1st is selected', function () {
    autocompleteWrapper.setState({ 'isOpen': true });

    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({ 'highlightedIndex': 0 });

    autocompleteInputWrapper.simulate('keyDown', { key: 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49);
  });
});

describe('Autocomplete kewDown->Enter event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should do nothing if the menu is closed', function () {
    autocompleteWrapper.setState({ 'isOpen': false });
    autocompleteWrapper.simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13 });
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
  });

  it('should close menu if input has focus but no item has been selected and then the Enter key is hit', function () {
    var value = '';
    autocompleteWrapper.setState({ 'isOpen': true });
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value: value, onSelect: function onSelect(v) {
        value = v;
      } });

    // simulate keyUp of backspace, triggering autocomplete suggestion on an empty string, which should result in nothing highlighted
    autocompleteInputWrapper.simulate('keyUp', { key: 'Backspace', keyCode: 8, which: 8 });
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);

    autocompleteInputWrapper.simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13 });

    expect(value).toEqual('');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
  });

  it('should invoke `onSelect` with the selected menu item and close the menu', function () {
    var value = 'Ar';
    var defaultPrevented = false;
    autocompleteWrapper.setState({ 'isOpen': true });
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value: value, onSelect: function onSelect(v) {
        value = v;
      } });

    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key: 'r', keyCode: 82, which: 82 });

    // Hit enter, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13, preventDefault: function preventDefault() {
        defaultPrevented = true;
      } });
    expect(value).toEqual('Arizona');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(defaultPrevented).toBe(true);
  });
});

describe('Autocomplete kewDown->Escape event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should unhighlight any selected menu item + close the menu', function () {
    autocompleteWrapper.setState({ 'isOpen': true });
    autocompleteWrapper.setState({ 'highlightedIndex': 0 });

    autocompleteInputWrapper.simulate('keyDown', { key: 'Escape', keyCode: 27, which: 27 });

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });
});

describe('Autocomplete click event handlers', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should update input value from selected menu item and close the menu', function () {
    var value = 'Ar';
    autocompleteWrapper.setProps({
      value: value,
      onSelect: function onSelect(v) {
        value = v;
      }
    });
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteInputWrapper.simulate('change', { target: { value: value } });

    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key: 'r', keyCode: 82, which: 82 });

    // Click inside input, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('click');
    expect(value).toEqual('Arizona');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
  });
});

// Component method unit tests
describe('Autocomplete#renderMenu', function () {

  var autocompleteWrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should return a <div ref="menu"> ReactComponent when renderMenu() is called', function () {
    //autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.type).toEqual('div');
    expect(autocompleteMenu.ref).toEqual('menu');
    expect(autocompleteMenu.props.children.length).toEqual(50);
  });

  it('should return a menu ReactComponent with a subset of children when partial match text has been entered', function () {
    // Input 'Ar' should result in 6 items in the menu, populated from autocomplete.
    autocompleteWrapper.setProps({ value: 'Ar' });

    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.props.children.length).toEqual(6);
  });

  it('should allow using custom components', function () {
    var Menu = (function (_React$Component) {
      _inherits(Menu, _React$Component);

      function Menu() {
        _classCallCheck(this, Menu);

        _get(Object.getPrototypeOf(Menu.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(Menu, [{
        key: 'render',
        value: function render() {
          return _react2['default'].createElement(
            'div',
            null,
            this.props.items
          );
        }
      }]);

      return Menu;
    })(_react2['default'].Component);

    var Item = (function (_React$Component2) {
      _inherits(Item, _React$Component2);

      function Item() {
        _classCallCheck(this, Item);

        _get(Object.getPrototypeOf(Item.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(Item, [{
        key: 'render',
        value: function render() {
          return _react2['default'].createElement(
            'div',
            null,
            this.props.item.name
          );
        }
      }]);

      return Item;
    })(_react2['default'].Component);

    var wrapper = (0, _enzyme.mount)(AutocompleteComponentJSX({
      renderMenu: function renderMenu(items) {
        return _react2['default'].createElement(Menu, { items: items });
      },
      renderItem: function renderItem(item) {
        return _react2['default'].createElement(Item, { key: item.abbr, item: item });
      }
    }));
    wrapper.setState({ isOpen: true, highlightedIndex: 0 });
    expect(wrapper.find(Menu).length).toBe(1);
    expect(wrapper.find(Item).length).toBe(50);
  });
});