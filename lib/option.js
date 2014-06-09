/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({

  render: function() {
    return <div
      className="rf-combobox-option"
      tabIndex="-1"
      onKeyDown={this.props.onKeyDown}
      onMouseEnter={this.props.onMouseEnter}
      key={this.props.value}
    >{this.props.children}</div>;
  }

});


