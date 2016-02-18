import React from 'react'
import Autocomplete from '../Autocomplete';
import jsdom from 'mocha-jsdom';
import chai from 'chai';
const expect = chai.expect;
import chaiEnzyme from 'chai-enzyme';
import { ok, equal } from 'assert';
import { mount } from 'enzyme';

chai.use(chaiEnzyme());

function usStateAutocompleteWrapper() {
  return mount(<Autocomplete 
    initialValue='Ma'      
    labelText="Choose a state from the US"
    inputProps={{name: "US state"}}
    getItemValue={(item) => item.name}
    renderItem={(item, isHighlighted) => (
      <div
        style={isHightlighted ? styles.highlightedItem : styles.item} 
        key={item.abbr}
      >{item.name}</div>
    )}
  />);
}
describe('react-autocomplete', function() {
  it('should have tests', () => ok(true));
});

describe('static-data-example', () => {
  jsdom();

  it('should show results when partial match is typed in', () => {
    const autocomplete = usStateAutocompleteWrapper();
    expect(autocomplete.find('input')).to.exist;
    ok(false);
  });
});
