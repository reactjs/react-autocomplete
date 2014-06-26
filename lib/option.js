var React = require('react');

module.exports = React.createClass({

  getDefaultProps: function() {
    return {
      role: 'option',
      tabIndex: '-1',
      className: 'rf-combobox-option',
      isSelected: false
    };
  },

  render: function() {
    var props = this.props;
    if (props.isSelected)
      props.className = addClass(props.className, 'rf-combobox-selected');
    return React.DOM.div(props);
  }

});

function addClass(existing, added) {
  if (!existing) return added;
  if (existing.indexOf(added) > -1) return existing;
  return existing + ' ' + added;
}

