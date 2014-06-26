/** @jsx React.DOM */
var React = require('react');
var Combobox = require('../lib/combobox');
var ComboboxOption = require('../lib/option');
var states = require('./states');

var App = React.createClass({

  getInitialState: function() {
    return {
      states: states,
      selectedStateId: 'UT'
    };
  },

  handleInput: function(userInput) {
    this.setState({selectedStateId: null});
    this.filterStates(userInput);
  },

  filterStates: function(userInput) {
    if (userInput === '')
      return this.setState({states: states});
    var filter = new RegExp('^'+userInput, 'i');
    this.setState({states: states.filter(function(state) {
      return filter.test(state.name) || filter.test(state.id);
    })});
  },

  handleStateSelect: function(value, combobox) {
    this.setState({
      selectedStateId: value,
      states: states
    });
  },

  renderComboboxOptions: function() {
    return this.state.states.map(function(state) {
      return (
        <ComboboxOption
          key={state.id}
          value={state.id}
        >{state.name}</ComboboxOption>
      );
    });
  },

  render: function() {
    return (
      <div>
        <h1>React Combobox</h1>
        <p>Selected State: {this.state.selectedStateId}</p>
        <Combobox
          onInput={this.handleInput}
          onSelect={this.handleStateSelect}
          value={this.state.selectedStateId}
        >
          {this.renderComboboxOptions()}
        </Combobox>
        <div><button>something else to focus</button></div>
      </div>
    );
  }
});

React.renderComponent(<App/>, document.body);

