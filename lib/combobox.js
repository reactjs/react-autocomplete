/** @jsx React.DOM */

var React = require('react');
var Option = require('./option');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      value: null,
      inputValue: null,
      isVisible: false,
      focusedIndex: null,
      autocompletedOption: null,
      selectedIndex: null
    };
  },

  render: function() {
    return (
      <div className={this.getClassName()}>
        <input
          ref="input"
          className="rf-combobox-input"
          value={this.state.inputValue}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleKeydown}
          onKeyUp={this.handleInputKeyUp}
        />
        <div ref="list" className="rf-combobox-list">
          {this.mapChildren()}
        </div>
      </div>
    );
  },

  mapChildren: function() {
    return React.Children.map(this.props.children, function(child, index) {
      var props = child.props;
      props.className = props.className + ' rf-combobox-option';
      props.tabIndex="-1";
      props.onKeyDown = this.handleOptionKeyDown.bind(this, child);
      props.onMouseEnter = this.handleOptionMouseEnter.bind(this, index);
      props.key = props.value;
      return React.DOM.div(props);
    }.bind(this));
  },

  getClassName: function() {
    var className = 'rf-combobox';
    if (this.state.isVisible)
      className += ' rf-combobox-is-visible';
    return className;
  },

  handleInputChange: function(event) {
    this.setState({
      focusedIndex: null,
      inputValue: null,
      value: null,
      autocompletedOption: null,
      selectedIndex: null
    });
    if (!this.state.isVisible)
      this.showList();
    var value = this.refs.input.getDOMNode().value;
    this.props.onInput(value);
  },

  handleInputBlur: function() {
    var focusedAnOption = this.state.focusedIndex != null;
    if (focusedAnOption)
      return;
    this.maybeSelectAutocompletedOption();
    this.setState({isVisible: false});
  },

  handleInputKeyUp: function(event) {
    if (event.keyCode === 8 /*backspace*/ || this.props.autocomplete === false)
      return;
    this.autocompleteInputValue();
  },

  autocompleteInputValue: function() {
    if (this.props.children.length === 0)
      return;
    var input = this.refs.input.getDOMNode();
    var inputValue = input.value;
    var firstChild = this.props.children.length ? this.props.children[0] : this.props.children;
    var label = getLabel(firstChild);
    var fragment = matchFragment(inputValue, label);
    if (!fragment)
      return;
    input.value = label;
    input.setSelectionRange(inputValue.length, label.length);
    this.setState({autocompletedOption: firstChild});
  },

  showList: function() {
    this.setState({isVisible: true});
  },

  hideOnEscape: function() {
    // TODO maybe clear out some more state here
    this.setState({isVisible: false});
    this.focusInput();
  },

  focusInput: function() {
    this.refs.input.getDOMNode().focus();
  },

  inputKeydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    27: 'hideOnEscape',
    13: 'selectOnEnter'
  },

  optionKeydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    13: 'selectOption',
    27: 'hideOnEscape'
  },

  handleKeydown: function(event) {
    var handlerName = this.inputKeydownMap[event.keyCode];
    if (!handlerName)
      return
    event.preventDefault();
    this[handlerName].call(this);
  },

  handleOptionKeyDown: function(child, event) {
    var handlerName = this.optionKeydownMap[event.keyCode];
    if (!handlerName)
      return
    event.preventDefault();
    this[handlerName].call(this, child);
  },

  handleOptionMouseEnter: function(index) {
    this.focusOptionAtIndex(index);
  },

  selectOnEnter: function() {
    this.maybeSelectAutocompletedOption();
    this.refs.input.getDOMNode().select();
  },

  maybeSelectAutocompletedOption: function() {
    if (!this.state.autocompletedOption)
      return;
    this.selectOption(this.state.autocompletedOption, {focus: false});
  },

  selectOption: function(child, options) {
    options = options || {};
    var index = this.props.children.indexOf(child)
    this.props.onSelect(child.props.value, child);
    this.setState({
      value: child.props.value,
      inputValue: getLabel(child),
      autocompletedOption: null,
      isVisible: false,
      selectedIndex: index
    });
    if (options.focus !== false)
      this.focusInput();
  },

  focusNext: function() {
    var index;
    if (!this.state.isVisible && this.state.selectedIndex)
      index = this.state.selectedIndex;
    else
      index = this.state.focusedIndex == null ? 0 : this.state.focusedIndex + 1;
    this.focusOptionAtIndex(index);
  },

  focusPrevious: function() {
    var index;
    var last = this.props.children.length - 1;
    if (!this.state.isVisible && this.state.selectedIndex)
      index = this.state.selectedIndex;
    else
      index = this.state.focusedIndex == null ? last : this.state.focusedIndex - 1;
    this.focusOptionAtIndex(index);
  },

  focusOptionAtIndex: function(index) {
    this.showList();
    var length = this.props.children.length;
    if (index === -1)
      index = length - 1;
    else if (index === length)
      index = 0;
    this.setState({
      focusedIndex: index
    }, this.focusOption);
  },

  focusOption: function() {
    var index = this.state.focusedIndex;
    this.refs.list.getDOMNode().childNodes[index].focus();
  }

});

function getLabel(component) {
  return component.props.label || component.props.children;
}

function matchFragment(userInput, firstChildLabel) {
  userInput = userInput.toLowerCase();
  firstChildLabel = firstChildLabel.toLowerCase();
  if (userInput === '' || userInput === firstChildLabel)
    return false;
  if (firstChildLabel.toLowerCase().indexOf(userInput.toLowerCase()) === -1)
    return false;
  return true;
}

