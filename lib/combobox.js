/** @jsx React.DOM */

var React = require('react');
var Option = require('./option');
//var Input = require('./input');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      value: null,
      inputValue: null,
      isVisible: false,
      focusedIndex: null
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
      props.onKeyDown = this.handleOptionKeyDown.bind(this, child);
      props.onMouseEnter = this.handleOptionMouseEnter.bind(this, index);
      return Option(props);
    }.bind(this));
  },

  getClassName: function() {
    var className = 'rf-combobox';
    if (this.state.isVisible)
      className += ' rf-combobox-is-visible';
    return className;
  },

  handleInputChange: function(event) {
    console.log('handleInputChange');
    this.setState({
      focusedIndex: null,
      inputValue: null,
      value: null
    });
    if (!this.state.isVisible)
      this.showList();
    var value = this.refs.input.getDOMNode().value;
    this.props.onInput(value);
  },

  handleInputBlur: function() {
    if (this.state.focusedIndex != null)
      return;
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
  },

  showList: function() {
    this.setState({isVisible: true});
  },

  hideOnEscape: function() {
    this.setState({isVisible: false});
    this.focusInput();
  },

  focusInput: function() {
    this.refs.input.getDOMNode().focus();
  },

  keydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    27: 'hideOnEscape'
  },

  optionKeydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    13: 'selectOption',
    27: 'hideOnEscape'
  },

  handleKeydown: function(event) {
    var handlerName = this.keydownMap[event.keyCode];
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

  selectOption: function(child) {
    this.props.onSelect(child.props.value, child);
    this.setState({
      value: child.props.value,
      inputValue: getLabel(child),
      isVisible: false
    });
    this.focusInput();
  },

  focusNext: function() {
    this.showList();
    var index = this.state.focusedIndex == null ?
      0 : this.state.focusedIndex + 1;
    this.focusOptionAtIndex(index);
  },

  focusPrevious: function() {
    this.showList();
    var last = this.props.children.length - 1;
    var index = this.state.focusedIndex == null ?
      last : this.state.focusedIndex - 1;
    this.focusOptionAtIndex(index);
  },

  focusOptionAtIndex: function(index) {
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

