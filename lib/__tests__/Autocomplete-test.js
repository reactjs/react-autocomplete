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
      initialValue=''      
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

describe('acceptance tests', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should display autocomplete menu when input has focus', () => {

    // Display autocomplete menu upon input focus
    expect(autocompleteWrapper.state('isOpen')).to.be.false;
    expect(autocompleteWrapper.instance().refs.menu).to.not.exist;

    autocompleteInputWrapper.simulate('focus');

    expect(autocompleteWrapper.ref('menu').nodes[0]).to.be.ok;
    expect(autocompleteWrapper.instance().refs.menu).to.exist;
  });

  it('should show results when partial match is typed in', () => {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(50);
    autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(6);

  });
});

describe('Autocomplete kewDown->Enter event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should do nothing if the menu is closed', () => {
    autocompleteWrapper.setState({'isOpen': false});
    autocompleteWrapper.simulate('keyDown', { key : "Enter", keyCode: 13, which: 13 });
    expect(autocompleteWrapper.state('isOpen')).to.be.false;
  });

  it('should close menu if input has focus but no item has been selected and then the Enter key is hit', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    
    // simulate keyUp of backspace, triggering autocomplete suggestion on an empty string, which should result in nothing highlighted
    autocompleteInputWrapper.simulate('keyUp', { key : 'Backspace', keyCode: 8, which: 8 }); 
    expect(autocompleteWrapper.state('highlightedIndex')).to.be.null;

    autocompleteInputWrapper.simulate('keyDown', { key : "Enter", keyCode: 13, which: 13 });

    expect(autocompleteWrapper.state('value')).to.equal('');
    expect(autocompleteWrapper.state('isOpen')).to.be.false;

  });

  it('should update input value from selected menu item and close the menu', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    
    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key : 'r', keyCode: 82, which: 82 }); 

    // Hit enter, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });
    expect(autocompleteWrapper.state('value')).to.equal('Arizona');
    expect(autocompleteWrapper.state('isOpen')).to.be.false;

  });

});
