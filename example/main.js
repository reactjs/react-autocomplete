/** @jsx React.DOM */
var React = require('react');
var Combobox = require('../lib/combobox');
var Option = require('../lib/option');
var states = require('./states');

var App = React.createClass({

  getInitialState: function() {
    return {states: states};
  },

  filterStates: function(userInput) {
    if (userInput === '')
      return this.setState({states: states});

    var filter = new RegExp('^'+userInput, 'i');
    this.setState({states: states.filter(function(state) {
      return filter.test(state.name) || filter.test(state.id);
    })});
  },

  render: function() {
    var options = this.state.states.map(function(state) {
      return <Option value={state.id}>{state.name}</Option>;
    });

    return (
      <div>
        <h1>React Combobox</h1>
        <Combobox onInput={this.filterStates}>
          {options}
        </Combobox>
      </div>
    );
  }
});

React.renderComponent(<App/>, document.body);

