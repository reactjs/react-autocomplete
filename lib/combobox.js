/** @jsx React.DOM */

var React = require('react');
var guid = 0;
var k = function(){};
var addClass = require('./add-class');

module.exports = React.createClass({

  propTypes: {

    /**
     * If true, will autocomplete the first matched option into the input
     * element's value.
     *
     * @public
    */
    autocomplete: React.PropTypes.bool,

    /**
     * Called when the combobox receives user input, this is your chance to
     * filter the data and rerender the options.
     *
     * Signature:
     *
     * ```js
     * function(userInput){}
     * ```
     * @public
    */
    onInput: React.PropTypes.func,

    /**
     * Called when the combobox receives a selection. You probably want to reset
     * the options to the full list at this point.
     *
     * Signature:
     *
     * ```js
     * function(selectedValue){}
     * ```
     * @public
    */
    onSelect: React.PropTypes.func,

    /**
     * The initial value of the component.
     * @public
    */
    value: React.PropTypes.any
  },

  getDefaultProps: function() {
    return {
      autocomplete: true,
      onInput: k,
      onSelect: k,
      value: null
    };
  },

  getInitialState: function() {
    return {
      value: this.props.value,
      // the value displayed in the input
      inputValue: this.findInitialInputValue(),
      isOpen: false,
      focusedIndex: null,
      matchedAutocompleteOption: null,
      // this prevents crazy jumpiness since we focus options on mouseenter
      usingKeyboard: false,
      activedescendant: null,
      listId: 'rf-combobox-list-'+(++guid)
    };
  },

  /**
   * We don't create the <ComboboxOption> components, the user supplies them,
   * so before rendering we attach handlers to facilitate communication from
   * the ComboboxOption to the Combobox.
  */
  decoratedMenuOptions: function() {
    // TODO: strange side-effect here, we need to tell the input who its
    // activedescendant is, this is the most convenient place to do it, maybe
    // there's a better way?
    var activedescendant;
    React.Children.forEach(this.props.children, function(child, index) {
      // TODO: cloneWithProps and map instead of altering the children in-place
      var props = child.props;
      if (this.state.value === props.value) {
        // need an ID for WAI-ARIA
        props.id = props.id || 'rf-combobox-selected-'+(++guid);
        props.isSelected = true
        activedescendant = props.id;
      }
      props.onBlur = this.handleOptionBlur;
      props.onClick = this.selectOption.bind(this, child);
      props.onFocus = this.handleOptionFocus;
      props.onKeyDown = this.handleOptionKeyDown.bind(this, child);
      props.onMouseEnter = this.handleOptionMouseEnter.bind(this, index);
    }.bind(this));
    return {
      components: this.props.children,
      activedescendant: activedescendant
    };
  },

  getClassName: function() {
    var className = addClass(this.props.className, 'rf-combobox');
    if (this.state.isOpen)
      className = addClass(className, 'rf-combobox-is-open');
    return className;
  },

  /**
   * When the user begins typing again we need to clear out any state that has
   * to do with an existing or potential selection.
  */
  clearSelectedState: function(cb) {
    this.setState({
      focusedIndex: null,
      inputValue: null,
      value: null,
      matchedAutocompleteOption: null,
      activedescendant: null
    }, cb);
  },

  handleInputChange: function(event) {
    var value = this.refs.input.getDOMNode().value;
    this.clearSelectedState(function() {
      this.props.onInput(value);
      if (!this.state.isOpen)
        this.showList();
    }.bind(this));
  },

  handleInputBlur: function() {
    var focusedAnOption = this.state.focusedIndex != null;
    if (focusedAnOption)
      return;
    this.maybeSelectAutocompletedOption();
    this.hideList();
  },

  handleOptionBlur: function() {
    // don't want to hide the list if we focused another option
    this.blurTimer = setTimeout(this.hideList, 0);
  },

  handleOptionFocus: function() {
    // see `handleOptionBlur`
    clearTimeout(this.blurTimer);
  },

  handleInputKeyUp: function(event) {
    if (
      // autocompleting while backspacing feels super weird, so let's not
      event.keyCode === 8 /*backspace*/ ||
      this.props.autocomplete+'' === 'false'
    ) return;
    this.autocompleteInputValue();
  },

  /**
   * Autocompletes the input value with a matching label of the first
   * ComboboxOption in the list and selects only the fragment that has
   * been added, allowing the user to keep typing naturally.
  */
  autocompleteInputValue: function() {
    if (
      this.props.autocomplete == false ||
      this.props.children.length === 0
    ) return;
    var input = this.refs.input.getDOMNode();
    var inputValue = input.value;
    var firstChild = this.props.children.length ?
      this.props.children[0] :
      this.props.children;
    var label = getLabel(firstChild);
    var fragment = matchFragment(inputValue, label);
    if (!fragment)
      return;
    input.value = label;
    input.setSelectionRange(inputValue.length, label.length);
    this.setState({matchedAutocompleteOption: firstChild});
  },

  handleButtonClick: function() {
    this.state.isOpen ? this.hideList() : this.showList();
    this.focusInput();
  },

  showList: function() {
    this.setState({isOpen: true});
  },

  hideList: function() {
    this.setState({isOpen: false});
  },

  hideOnEscape: function() {
    this.hideList();
    this.focusInput();
  },

  focusInput: function() {
    this.refs.input.getDOMNode().focus();
  },

  selectInput: function() {
    this.refs.input.getDOMNode().select();
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
    this.setState({usingKeyboard: true});
    this[handlerName].call(this);
  },

  handleOptionKeyDown: function(child, event) {
    var handlerName = this.optionKeydownMap[event.keyCode];
    if (!handlerName) {
      // if the user starts typing again while focused on an option, move focus
      // to the input, select so it wipes out any existing value
      this.selectInput();
      return;
    }
    event.preventDefault();
    this.setState({usingKeyboard: true});
    this[handlerName].call(this, child);
  },

  handleOptionMouseEnter: function(index) {
    if (this.state.usingKeyboard)
      this.setState({usingKeyboard: false});
    else
      this.focusOptionAtIndex(index);
  },

  selectOnEnter: function() {
    this.maybeSelectAutocompletedOption();
    this.refs.input.getDOMNode().select();
  },

  maybeSelectAutocompletedOption: function() {
    if (!this.state.matchedAutocompleteOption)
      return;
    this.selectOption(this.state.matchedAutocompleteOption, {focus: false});
  },

  selectOption: function(child, options) {
    options = options || {};
    this.setState({
      value: child.props.value,
      inputValue: getLabel(child),
      matchedAutocompleteOption: null
    }, function() {
      this.props.onSelect(child.props.value, child);
      this.hideList();
      if (options.focus !== false)
        this.selectInput();
    }.bind(this));
  },

  focusNext: function() {
    var index = this.state.focusedIndex == null ?
      0 : this.state.focusedIndex + 1;
    this.focusOptionAtIndex(index);
  },

  focusPrevious: function() {
    var last = this.props.children.length - 1;
    var index = this.state.focusedIndex == null ?
      last : this.state.focusedIndex - 1;
    this.focusOptionAtIndex(index);
  },

  focusSelectedOption: function() {
    var selectedIndex;
    React.Children.forEach(this.props.children, function(child, index) {
      if (child.props.value === this.state.value)
        selectedIndex = index;
    }.bind(this));
    this.showList();
    this.setState({
      focusedIndex: selectedIndex
    }, this.focusOption);
  },

  findInitialInputValue: function() {
    // TODO: might not need this, we should know this in `decoratedMenuOptions`
    var inputValue;
    React.Children.forEach(this.props.children, function(child) {
      if (child.props.value === this.props.value)
        inputValue = getLabel(child);
    }.bind(this));
    return inputValue;
  },

  focusOptionAtIndex: function(index) {
    if (!this.state.isOpen && this.state.value)
      return this.focusSelectedOption();
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
  },

  render: function() {
    var menuOptions = this.decoratedMenuOptions();
    return (
      <div className={this.getClassName()}>
        <input
          ref="input"
          className="rf-combobox-input"
          defaultValue={this.props.value}
          value={this.state.inputValue}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleKeydown}
          onKeyUp={this.handleInputKeyUp}
          role="combobox"
          aria-activedescendant={menuOptions.activedescendant}
          aria-autocomplete={this.props.autocomplete+''}
          aria-owns={this.state.listId}
        />
        <span
          aria-hidden="true"
          className="rf-combobox-button"
          onClick={this.handleButtonClick}
        >▾</span>
        <div
          id={this.state.listId}
          ref="list"
          className="rf-combobox-list"
          aria-expanded={this.state.isOpen+''}
          role="listbox"
        >{menuOptions.components}</div>
      </div>
    );
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

