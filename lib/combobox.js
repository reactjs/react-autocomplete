/** @jsx React.DOM */

var React = require('react');
var Option = require('./option');
//var Input = require('./input');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      isVisible: false,
      focusedIndex: null,
      hoveredIndex: null
    };
  },

  render: function() {
    return (
      <div className={this.getClassName()}>
        <input
          ref="input"
          className="rf-combobox-input"
          onInput={this.handleInput}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleKeydown}
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
      props.onKeyDown = this.handleOptionKeyDown;
      props.onMouseEnter = this.handleOptionMouseEnter;
      props.key = child.props.value;
      return Option(props);
    }.bind(this));
  },

  getClassName: function() {
    var className = 'rf-combobox';
    if (this.state.isVisible)
      className += ' rf-combobox-is-visible';
    return className;
  },

  clearIntermidiaryListState: function() {
    this.setState({
      focusedIndex: null,
      hoveredIndex: null
    });
  },

  handleInput: function(event) {
    this.clearIntermidiaryListState();
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

  showList: function() {
    this.setState({isVisible: true});
  },

  keydownMap: {
    38: 'focusPrevious',
    40: 'focusNext'
  },

  handleKeydown: function(event) {
    var handlerName = this.keydownMap[event.keyCode];
    if (!handlerName)
      return
    event.preventDefault();
    this[handlerName].call(this);
  },

  handleOptionKeyDown: function() {
    return this.handleKeydown.apply(this, arguments);
  },

  handleOptionMouseEnter: function(index) {
    console.log('dude', index);
    this.setState({hoveredIndex: index});
  },

  focusNext: function() {
    this.showList();
    var index;
    if (this.state.hoveredIndex)
      index = this.state.hoveredIndex;
    else
      index = this.state.focusedIndex == null ? 0 : this.state.focusedIndex + 1;
    this.focusOptionAtIndex(index);
  },

  focusPrevious: function() {
    this.showList();
    var index;
    var last = this.props.children.length - 1;
    if (this.state.hoveredIndex)
      index = this.state.hoveredIndex;
    else
      index = this.state.focusedIndex == null ? last : this.state.focusedIndex - 1;
    this.focusOptionAtIndex(index);
  },

  focusOptionAtIndex: function(index) {
    var length = this.props.children.length;
    if (index === -1)
      index = length - 1;
    else if (index === length)
      index = 0;
    this.setState({focusedIndex: index}, this.focusOption);
  },

  focusOption: function() {
    var index = this.state.focusedIndex;
    this.refs.list.getDOMNode().childNodes[index].focus();
  }

});

