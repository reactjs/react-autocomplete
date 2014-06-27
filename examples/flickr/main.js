/** @jsx React.DOM */
var React = require('react');
//var Autocomplete = require('react-autocomplete');
var Autocomplete = require('../../lib/main');
var Combobox = Autocomplete.Combobox;
var ComboboxOption = Autocomplete.Option;

var App = React.createClass({

  getInitialState: function() {
    return {
      flickrResponse: { items: [] },
      selections: [],
      loading: false
    };
  },

  handleSelect: function(selection) {
    this.setState({
      selections: this.state.selections.concat(selection)
    });
  },

  handleInput: throttle(500, function(userInput) {
    this.setState({
      loading: true,
      flickrResponse: {items: []}
    }, function() {
      var url = 'http://www.flickr.com/services/feeds/photos_public.gne?jsoncallback=?';
      this.pendingRequest = $.getJSON(url, {tags: userInput, format: 'json' }, function(res) {
        this.setState({loading: false, flickrResponse: res});
      }.bind(this));
      console.log(this.pendingRequest.abort);
    }.bind(this));
  }),

  componentWillUnmount: function() {
    this.pendingRequest && this.pendingRequest.abort();
  },

  renderComboboxOptions: function() {
    return this.state.flickrResponse.items.map(function(image) {
      return (
        <ComboboxOption key={image.link} value={image} label=''>
          <img src={image.media.m} height="50" />
        </ComboboxOption>
      );
    });
  },

  renderSelections: function() {
    return this.state.selections.map(function(image) {
      return <img src={image.media.m}/>;
    });
  },

  renderMenuContent: function() {
    if (this.state.loading) {
      return <div style={{padding: '8px'}} aria-live="polite">Searching ...</div>;
    }
    return this.state.flickrResponse.items.length ?
      this.renderComboboxOptions() :
      <div style={{padding: '8px'}} aria-live="polite">No matches</div>;
  },

  render: function() {
    return (
      <div>
        <h1>React Combobox</h1>
        <p><a href="https://github.com/rpflorence/react-combobox/blob/master/examples/flickr/main.js">Demo Source</a></p>
        <Combobox
          onInput={this.handleInput}
          onSelect={this.handleSelect}
        >
          {this.renderMenuContent()}
        </Combobox>
        <div>
          {this.renderSelections()}
        </div>
      </div>
    );
  }
});

React.renderComponent(<App/>, document.body);

function throttle(delay, fn){
  var context, timeout, result, args,
    cur, diff, prev = 0;
  function delayed(){
    prev = Date.now();
    timeout = null;
    result = fn.apply(context, args);
  }
  function throttled(){
    context = this;
    args = arguments;
    cur = Date.now();
    diff = delay - (cur - prev);
    if (diff <= 0) {
      clearTimeout(timeout);
      prev = cur;
      result = fn.apply(context, args);
    } else if (! timeout) {
      timeout = setTimeout(delayed, diff);
    }
    return result;
  }
  throttled.cancel = function(){
    clearTimeout(timeout);
  };
  return throttled;
}


