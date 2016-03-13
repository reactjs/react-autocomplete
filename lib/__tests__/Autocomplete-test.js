import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import jsdom from 'mocha-jsdom';
import chai from 'chai';
const expect = chai.expect;
import chaiEnzyme from 'chai-enzyme'
import { ok, equal } from 'assert';
import { mount, shallow } from 'enzyme';
import Autocomplete from '../Autocomplete';
import { getStates, matchStateToTerm, sortStates, styles } from '../utils'

chai.use(chaiEnzyme());

function AutocompleteComponentJSX (extraProps) {
  return (
    <Autocomplete 
      labelText="Choose a state from the US"
      inputProps={{name: "US state"}}
      getItemValue={(item) => item.name}
      items={getStates()}
      renderItem={(item, isHighlighted) => (
        <div
          style={isHighlighted ? styles.highlightedItem : styles.item} 
          key={item.abbr}
        >{item.name}</div>
      )}
      shouldItemRender={matchStateToTerm}
      {...extraProps}
    />
  )
};

describe('Autocomplete acceptance tests', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should display autocomplete menu when input has focus', () => {

    expect(autocompleteWrapper.state('isOpen')).to.be.false;
    expect(autocompleteWrapper.instance().refs.menu).to.not.exist;

    // Display autocomplete menu upon input focus
    autocompleteInputWrapper.simulate('focus');

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.instance().refs.menu).to.exist;
  });

  it('should show results when value is a partial match', () => {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(50);
    autocompleteWrapper.setProps({ value: 'Ar' });
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(6);

  });

  it('should close autocomplete menu when input is blurred', () => {

    autocompleteInputWrapper.simulate('blur');

    expect(autocompleteWrapper.state('isOpen')).to.be.false;
    expect(autocompleteWrapper.instance().refs.menu).to.not.exist;

  });

});

// Event handler unit tests

describe('Autocomplete keyPress-><character> event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should pass updated `input.value` to `onChange` and replace with `props.value`', done => {

    let value = '';
    autocompleteWrapper.setProps({ value, onChange(_, v) { value = v; } });

    autocompleteInputWrapper.get(0).value = 'a';
    autocompleteInputWrapper.simulate('keyPress', { key : 'a', keyCode: 97, which: 97 });
    autocompleteInputWrapper.simulate('change');

    expect(autocompleteInputWrapper.get(0).value).to.equal('');
    expect(value).to.equal('a');
    done();
  });

});

describe('Autocomplete kewDown->ArrowDown event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should highlight the 1st item in the menu when none is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteWrapper.setState({'highlightedIndex': null});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(0);
  });

  it('should highlight the "n+1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': n});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(n+1);
  });

  it('should highlight the 1st item in the menu when the last is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': 49});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(0);
  });

});

describe('Autocomplete kewDown->ArrowUp event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should highlight the last item in the menu when none is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteWrapper.setState({'highlightedIndex': null});
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(49);
  });

  it('should highlight the "n-1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': n});

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(n-1);
  });

  it('should highlight the last item in the menu when the 1st is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': 0});

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).to.be.true;
    expect(autocompleteWrapper.state('highlightedIndex')).to.equal(49);
  });

});

describe('Autocomplete kewDown->Enter event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should do nothing if the menu is closed', () => {
    autocompleteWrapper.setState({'isOpen': false});
    autocompleteWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });
    expect(autocompleteWrapper.state('isOpen')).to.be.false;
  });

  it('should close menu if input has focus but no item has been selected and then the Enter key is hit', () => {
    let value = '';
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v; } });
    
    // simulate keyUp of backspace, triggering autocomplete suggestion on an empty string, which should result in nothing highlighted
    autocompleteInputWrapper.simulate('keyUp', { key : 'Backspace', keyCode: 8, which: 8 }); 
    expect(autocompleteWrapper.state('highlightedIndex')).to.be.null;

    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });

    expect(value).to.equal('');
    expect(autocompleteWrapper.state('isOpen')).to.be.false;

  });

  it('should invoke `onSelect` with the selected menu item and close the menu', () => {
    let value = 'Ar';
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v; } });
    
    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key : 'r', keyCode: 82, which: 82 }); 

    // Hit enter, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });
    expect(value).to.equal('Arizona');
    expect(autocompleteWrapper.state('isOpen')).to.be.false;

  });

});

describe('Autocomplete kewDown->Escape event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should unhighlight any selected menu item + close the menu', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteWrapper.setState({'highlightedIndex': 0});

    autocompleteInputWrapper.simulate('keyDown', { key : 'Escape', keyCode: 27, which: 27 });

    expect(autocompleteWrapper.state('isOpen')).to.be.false;
    expect(autocompleteWrapper.state('highlightedIndex')).to.be.null;
  });

});

// Component method unit tests
describe('Autocomplete#renderMenu', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should return a <div ref="menu"> ReactComponent when renderMenu() is called', () => {
    //autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.type).to.be.equal('div');
    expect(autocompleteMenu.ref).to.be.equal('menu');
    expect(autocompleteMenu.props.children.length).to.be.equal(50);
  });

  it('should return a menu ReactComponent with a subset of children when partial match text has been entered', () => {
    // Input 'Ar' should result in 6 items in the menu, populated from autocomplete.
    autocompleteWrapper.setProps({ value: 'Ar' });

    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.props.children.length).to.be.equal(6);

  });

});
