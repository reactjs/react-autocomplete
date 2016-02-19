import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import jsdom from 'mocha-jsdom';
import chai from 'chai';
const expect = chai.expect;
import chaiEnzyme from 'chai-enzyme';
import { ok, equal } from 'assert';
import { mount } from 'enzyme';
import Autocomplete from '../Autocomplete';
import { getStates, matchStateToTerm, sortStates, styles } from '../utils'

chai.use(chaiEnzyme());

function mountUsStateAutocompleteWrapper() {
  return mount(<Autocomplete 
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
  />);
}

describe('react-autocomplete', () => {

  var autocompleteWrapper = mountUsStateAutocompleteWrapper();
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should display autocomplete menu when input has focus', () => {

    // Display autocomplete menu upon input focus
    expect(autocompleteWrapper.state().isOpen).to.be.false;
    expect(autocompleteWrapper.instance().refs.menu).to.not.exist;

    autocompleteInputWrapper.simulate('focus');

    expect(autocompleteWrapper.state().isOpen).to.be.true;
    expect(autocompleteWrapper.instance().refs.menu).to.exist;
  });

  it('should show results when partial match is typed in', () => {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(50);
    autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    expect(autocompleteWrapper.ref('menu').children()).to.have.length(6);
  });
});
