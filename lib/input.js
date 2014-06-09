/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({

  render: function() {
    return <input
      onInput={this.handleInput}
      onBlur={this.handleBlur}
      className="rf-combobox-input"
    />
  },

  handleInput: function(event) {
    var value = this.getDOMNode().value;
    this.props.onInput(value);
  },

  handleBlur: function() {
    this.props.onBlur();
  }

});

