jest.unmock('../Autocomplete')
jest.unmock('../utils')

import React from 'react'
import { mount } from 'enzyme';
import Autocomplete from '../Autocomplete';
import { getStates, matchStateToTerm, sortStates, styles } from '../utils'

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

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.instance().refs.menu).toBe(undefined);

    // Display autocomplete menu upon input focus
    autocompleteInputWrapper.simulate('focus');

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.instance().refs.menu).not.toBe(undefined);
  });

  it('should show results when value is a partial match', () => {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children().length).toBe(50);
    autocompleteWrapper.setProps({ value: 'Ar' });
    expect(autocompleteWrapper.ref('menu').children().length).toBe(6);

  });

  it('should close autocomplete menu when input is blurred', () => {

    autocompleteInputWrapper.simulate('blur');

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.instance().refs.menu).toBe(undefined);

  });

  it('should reset `highlightedIndex` when `items` changes', () => {
    autocompleteWrapper.setState({ highlightedIndex: 10 });
    autocompleteWrapper.setProps({ items: [] });
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });

  it('should reset `highlightedIndex` when it falls outside of possible `items` range', () => {
    const items = getStates();
    autocompleteWrapper.setProps({ items });
    autocompleteWrapper.setState({ highlightedIndex: 10 });
    items.length = 5;
    autocompleteWrapper.setProps({ items });
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });

  it('should display menu based on `props.open` when provided', () => {
    const tree = mount(AutocompleteComponentJSX({}));
    expect(tree.state('isOpen')).toBe(false);
    expect(tree.find('> div').length).toBe(0);
    tree.setState({ isOpen: true });
    expect(tree.find('> div').length).toBe(1);
    tree.setProps({ open: false });
    tree.setState({ isOpen: false });
    expect(tree.find('> div').length).toBe(0);
    tree.setProps({ open: true });
    expect(tree.find('> div').length).toBe(1);
  });

  it('should invoke `props.inMenuVisibilityChange` when `state.isOpen` changes', () => {
    const onMenuVisibilityChange = jest.fn();
    const tree = mount(AutocompleteComponentJSX({ onMenuVisibilityChange }));
    expect(tree.state('isOpen')).toBe(false);
    expect(onMenuVisibilityChange.mock.calls.length).toBe(0);
    tree.setState({ isOpen: true });
    expect(onMenuVisibilityChange.mock.calls.length).toBe(1);
    expect(onMenuVisibilityChange.mock.calls[0][0]).toBe(true);
    tree.setState({ isOpen: false });
    expect(onMenuVisibilityChange.mock.calls.length).toBe(2);
    expect(onMenuVisibilityChange.mock.calls[1][0]).toBe(false);
  });

  it('should allow specifying any event handler via `props.inputProps`', () => {
    const handlers = ['Focus', 'Blur', 'KeyDown', 'KeyUp', 'Click'];
    const spies = [];
    const inputProps = {};
    handlers.forEach((handler, i) => inputProps[`on${handler}`] = spies[i] = jest.fn());
    const tree = mount(AutocompleteComponentJSX({ inputProps }));
    handlers.forEach((handler, i) => {
      tree.find('input').simulate(handler.toLowerCase());
      expect(spies[i].mock.calls.length).toBe(1, `${handler} handler was not called`);
      expect(spies[i].mock.calls[0][0]).toBeDefined(`${handler} handler did not receive event`);
    });
  })

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

    expect(autocompleteInputWrapper.get(0).value).toEqual('');
    expect(value).toEqual('a');
    done();
  });

  it('should highlight top match', () => {
    var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteWrapper.setProps({ value: 'a' });
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
  });

  it('should not highlight top match when autoHighlight=false', () => {
    var autocompleteWrapper = mount(AutocompleteComponentJSX({
      autoHighlight: false,
    }));
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteWrapper.setProps({ value: 'a' });
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(null);
  });

});

describe('Autocomplete kewDown->ArrowDown event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should highlight the 1st item in the menu when none is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteWrapper.setState({'highlightedIndex': null});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
  });

  it('should highlight the "n+1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': n});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n+1);
  });

  it('should highlight the 1st item in the menu when the last is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': 49});

    autocompleteInputWrapper.simulate('keyDown', { key : "ArrowDown", keyCode: 40, which: 40 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0);
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

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49);
  });

  it('should highlight the "n-1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    var n = 4;
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': n});

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n-1);
  });

  it('should highlight the last item in the menu when the 1st is selected', () => {
    autocompleteWrapper.setState({'isOpen': true});
    
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } });
    autocompleteWrapper.setState({'highlightedIndex': 0});

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 });

    expect(autocompleteWrapper.state('isOpen')).toBe(true);
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49);
  });

});

describe('Autocomplete kewDown->Enter event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should do nothing if the menu is closed', () => {
    autocompleteWrapper.setState({'isOpen': false});
    autocompleteWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
  });

  it('should close menu if input has focus but no item has been selected and then the Enter key is hit', () => {
    let value = '';
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v; } });
    
    // simulate keyUp of backspace, triggering autocomplete suggestion on an empty string, which should result in nothing highlighted
    autocompleteInputWrapper.simulate('keyUp', { key : 'Backspace', keyCode: 8, which: 8 }); 
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);

    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 });

    expect(value).toEqual('');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);

  });

  it('should invoke `onSelect` with the selected menu item and close the menu', () => {
    let value = 'Ar';
    let defaultPrevented = false;
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteInputWrapper.simulate('focus');
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v; } });
    
    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key : 'r', keyCode: 82, which: 82 }); 

    // Hit enter, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13, preventDefault() { defaultPrevented = true; } });
    expect(value).toEqual('Arizona');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(defaultPrevented).toBe(true);

  });

});

describe('Autocomplete kewDown->Escape event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should unhighlight any selected menu item + close the menu', () => {
    autocompleteWrapper.setState({'isOpen': true});
    autocompleteWrapper.setState({'highlightedIndex': 0});

    autocompleteInputWrapper.simulate('keyDown', { key : 'Escape', keyCode: 27, which: 27 });

    expect(autocompleteWrapper.state('isOpen')).toBe(false);
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null);
  });

});

describe('Autocomplete click event handlers', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should update input value from selected menu item and close the menu', () => {
    let value = 'Ar';
    autocompleteWrapper.setProps({
      value,
      onSelect(v) { value = v; },
    });
    autocompleteWrapper.setState({ isOpen: true });
    autocompleteInputWrapper.simulate('change', { target: { value } });
    
    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key : 'r', keyCode: 82, which: 82 }); 

    // Click inside input, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('click');
    expect(value).toEqual('Arizona');
    expect(autocompleteWrapper.state('isOpen')).toBe(false);
  });

});

// Component method unit tests
describe('Autocomplete#renderMenu', () => {

  var autocompleteWrapper = mount(AutocompleteComponentJSX({}));
  var autocompleteInputWrapper = autocompleteWrapper.find('input');

  it('should return a <div ref="menu"> ReactComponent when renderMenu() is called', () => {
    //autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } });
    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.type).toEqual('div');
    expect(autocompleteMenu.ref).toEqual('menu');
    expect(autocompleteMenu.props.children.length).toEqual(50);
  });

  it('should return a menu ReactComponent with a subset of children when partial match text has been entered', () => {
    // Input 'Ar' should result in 6 items in the menu, populated from autocomplete.
    autocompleteWrapper.setProps({ value: 'Ar' });

    var autocompleteMenu = autocompleteWrapper.instance().renderMenu();
    expect(autocompleteMenu.props.children.length).toEqual(6);

  });

  it('should allow using custom components', () => {
    class Menu extends React.Component {
      render () {
        return <div>{this.props.items}</div>
      }
    }
    class Item extends React.Component {
      render () {
        return <div>{this.props.item.name}</div>
      }
    }
    const wrapper = mount(AutocompleteComponentJSX({
      renderMenu (items) {
        return <Menu items={items} />
      },
      renderItem (item) {
        return <Item key={item.abbr} item={item} />
      }
    }));
    wrapper.setState({ isOpen: true, highlightedIndex: 0 });
    expect(wrapper.find(Menu).length).toBe(1)
    expect(wrapper.find(Item).length).toBe(50)
  });
});
