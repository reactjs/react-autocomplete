/** @jsx React.DOM */
var React = require('react');
//var Autocomplete = require('react-autocomplete');
var Autocomplete = require('../../lib/main');
var Combobox = Autocomplete.Combobox;
var ComboboxOption = Autocomplete.Option;
var states = require('../states');

var App = React.createClass({

  getInitialState: function() {
    return {
      // the data the user can select from
      states: states,

      // the current selection
      selectedStateId: 'UT'
    };
  },

  // called by the combobox when the user types into the field the point is to
  // set some state to cause a redraw of the options
  handleInput: function(userInput) {
    // make sure to clear out the current selection
    this.setState({selectedStateId: null}, function() {
      // and then do our client-side filtering, need to it after setState has happened
      // so that the value doesn't get rerendered to hte old selectedStateId
      // (this might be bad implementation at this point, still exploring a better
      // way to handle this)
      this.filterStates(userInput);
    }.bind(this));
  },

  // this demo uses client-side filtering, but you can easily query a server
  // instead and then set state when the response lands
  filterStates: function(userInput) {
    if (userInput === '')
      return this.setState({states: states});
    var filter = new RegExp('^'+userInput, 'i');
    setTimeout(function() {
      this.setState({states: states.filter(function(state) {
        // you can match anything you want, not just the labels
        return filter.test(state.name) || filter.test(state.id);
      })});
    }.bind(this), 500);
  },

  // Called by the Combobox when the user makes a selection
  handleStateSelect: function(value) {
    this.setState({
      selectedStateId: value,
      // for client-side filtering you probably want to populate your list
      // again so when they open it they can choose something besides what they
      // just picked
      states: states
    });
  },

  renderComboboxOptions: function() {
    // render calls this, it creates all the options for the combobox
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
    var menuContent = this.state.states.length ?
      this.renderComboboxOptions() :
      // if none of the options match what the user has typed, tell them
      <div style={{padding: '8px'}} aria-live="polite">No matches</div>;
    return (
      <div>
        <h1>React Combobox</h1>
        <p><a href="https://github.com/rpflorence/react-combobox/blob/master/example/main.js">Demo Source</a></p>
        <p>Selected State: {this.state.selectedStateId}</p>
        <Combobox
          onInput={this.handleInput}
          onSelect={this.handleStateSelect}
          value={this.state.selectedStateId}
        >
          {menuContent}
        </Combobox>
        <div><button>something else to focus</button></div>
      </div>
    );
  }
});

React.renderComponent(<App/>, document.body);

