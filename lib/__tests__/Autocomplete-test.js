import React from 'react'
import { mount, shallow } from 'enzyme'
import Autocomplete from '../Autocomplete'
import { getStates, getCategorizedStates, matchStateToTermWithHeaders } from '../utils'

function AutocompleteComponentJSX(extraProps) {
  return (
    <Autocomplete
      getItemValue={(item) => item.name}
      items={getStates()}
      renderItem={(item) => (
        <div
          key={item.abbr}
        >{item.name}</div>
      )}
      shouldItemRender={matchStateToTermWithHeaders}
      {...extraProps}
    />
  )
}

jest.useFakeTimers()

afterEach(() => {
  jest.clearAllTimers()
  setTimeout.mockClear()
  clearTimeout.mockClear()
})

describe('Autocomplete acceptance tests', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should display autocomplete menu when input has focus', () => {

    expect(autocompleteWrapper.state('isOpen')).toBe(false)
    expect(autocompleteWrapper.instance().refs.menu).toBe(undefined)

    // Display autocomplete menu upon input focus
    autocompleteInputWrapper.simulate('focus')

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.instance().refs.menu).not.toBe(undefined)
  })

  it('should show results when value is a partial match', () => {

    // Render autocomplete results upon partial input match
    expect(autocompleteWrapper.ref('menu').children().length).toBe(50)
    autocompleteWrapper.setProps({ value: 'Ar' })
    expect(autocompleteWrapper.ref('menu').children().length).toBe(6)

  })

  it('should close autocomplete menu when input is blurred', () => {

    autocompleteInputWrapper.simulate('blur')

    expect(autocompleteWrapper.state('isOpen')).toBe(false)
    expect(autocompleteWrapper.instance().refs.menu).toBe(null)

  })

  it('should highlight top match when `props.value` changes', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    expect(tree.state('highlightedIndex')).toEqual(null)
    tree.setProps({ value: 'a' })
    expect(tree.state('highlightedIndex')).toEqual(0)
  })

  it('should highlight top match when an item appears in `props.items` that matches `props.value`', () => {
    const tree = mount(AutocompleteComponentJSX({
      items: [],
    }))
    jest.spyOn(tree.instance(), 'maybeAutoCompleteText')
    tree.setProps({ value: 'a' })
    expect(tree.state('highlightedIndex')).toEqual(null)
    tree.setProps({ items: getStates() })
    expect(tree.instance().maybeAutoCompleteText).toHaveBeenCalledTimes(2)
    expect(tree.state('highlightedIndex')).toEqual(0)
  })

  it('should not highlight top match when `props.autoHighlight=false`', () => {
    const tree = mount(AutocompleteComponentJSX({
      autoHighlight: false,
    }))
    jest.spyOn(tree.instance(), 'maybeAutoCompleteText')
    tree.setProps({ value: 'a' })
    expect(tree.instance().maybeAutoCompleteText).not.toHaveBeenCalled()
    expect(tree.state('highlightedIndex')).toEqual(null)
  })

  it('should reset `state.highlightedIndex` when `props.value` becomes an empty string`', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    tree.setProps({ value: 'a' })
    expect(tree.state('highlightedIndex')).toEqual(0)
    tree.setProps({ value: '' })
    expect(tree.state('highlightedIndex')).toEqual(null)
  })

  it('should reset `state.highlightedIndex` if `props.value` doesn\'t match anything', () => {
    const tree = mount(AutocompleteComponentJSX({
      shouldItemRender() { return true },
    }))
    jest.spyOn(tree.instance(), 'maybeAutoCompleteText')
    tree.setProps({ value: 'ax' })
    expect(tree.instance().maybeAutoCompleteText).toHaveBeenCalledTimes(1)
    expect(tree.state('highlightedIndex')).toEqual(null)
  })

  it('should preserve `state.highlightedIndex` when `props.value` changes as long as it still matches', () => {
    const tree = mount(AutocompleteComponentJSX({
      value: 'h',
      shouldItemRender() { return true },
    }))
    tree.setState({ highlightedIndex: 10 })
    tree.setProps({ value: 'ha' })
    expect(tree.state('highlightedIndex')).toEqual(10)
  })

  it('should reset `state.highlightedIndex` when it falls outside of possible `props.items` range', () => {
    const items = getStates()
    autocompleteWrapper.setState({ highlightedIndex: 10 })
    items.length = 5
    autocompleteWrapper.setProps({ items })
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)
  })

  it('should preserve `state.highlightedIndex` when it is within `props.items` range and `props.value` is unchanged`', () => {
    const tree = mount(AutocompleteComponentJSX({
      value: 'a',
    }))
    tree.setState({ highlightedIndex: 0 })
    jest.spyOn(tree.instance(), 'ensureHighlightedIndex')
    tree.setProps({ value: 'a' })
    expect(tree.instance().ensureHighlightedIndex).toHaveBeenCalledTimes(1)
    expect(tree.state('highlightedIndex')).toEqual(0)
  })

  it('should preserve the matched item even when its previous place was outside of the new range', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    jest.spyOn(tree.instance(), 'maybeAutoCompleteText')
    tree.setProps({ value: 'ma' })
    tree.setState({ highlightedIndex: 3 }) // Massachusetts
    tree.setProps({ value: 'mas' })
    expect(tree.instance().maybeAutoCompleteText).toHaveBeenCalledTimes(2)
    expect(tree.state('highlightedIndex')).toEqual(0)
  })

  it('should display menu based on `props.open` when provided', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    expect(tree.state('isOpen')).toBe(false)
    expect(tree.find('> div').length).toBe(0)
    tree.setState({ isOpen: true })
    expect(tree.find('> div').length).toBe(1)
    tree.setProps({ open: false })
    tree.setState({ isOpen: false })
    expect(tree.find('> div').length).toBe(0)
    tree.setProps({ open: true })
    expect(tree.find('> div').length).toBe(1)
  })

  it('should set menu positions on initial render if the menu is visible', () => {
    const menuSpy = jest.fn(() => <div />)
    mount(AutocompleteComponentJSX({
      open: true,
      renderMenu: menuSpy,
    }))
    expect(menuSpy).toHaveBeenCalledTimes(2)
    // Initial render
    expect(menuSpy.mock.calls[0][2]).toEqual({ left: undefined, top: undefined, minWidth: undefined })
    // Re-render after componentDidMount
    expect(menuSpy.mock.calls[1][2]).toEqual({ left: 0, top: 0, minWidth: 0 })
  })

  it('should set menu positions when the menu is forced open via props.open', () => {
    const menuSpy = jest.fn(() => <div />)
    const tree = mount(AutocompleteComponentJSX({
      renderMenu: menuSpy,
    }))
    expect(menuSpy).not.toHaveBeenCalled()
    tree.setProps({ open: true })
    expect(menuSpy).toHaveBeenCalledTimes(2)
    expect(menuSpy.mock.calls[0][2]).toEqual({ left: undefined, top: undefined, minWidth: undefined })
    expect(menuSpy.mock.calls[1][2]).toEqual({ left: 0, top: 0, minWidth: 0 })
  })

  it('should invoke `props.inMenuVisibilityChange` when `state.isOpen` changes', () => {
    const onMenuVisibilityChange = jest.fn()
    const tree = mount(AutocompleteComponentJSX({ onMenuVisibilityChange }))
    expect(tree.state('isOpen')).toBe(false)
    expect(onMenuVisibilityChange).not.toHaveBeenCalled()
    tree.setState({ isOpen: true })
    expect(onMenuVisibilityChange).toHaveBeenCalledTimes(1)
    expect(onMenuVisibilityChange.mock.calls[0][0]).toBe(true)
    tree.setState({ isOpen: false })
    expect(onMenuVisibilityChange).toHaveBeenCalledTimes(2)
    expect(onMenuVisibilityChange.mock.calls[1][0]).toBe(false)
  })

  it('should allow specifying any event handler via `props.inputProps`', () => {
    const handlers = ['Focus', 'Blur', 'KeyDown', 'KeyUp', 'Click']
    const spies = []
    const inputProps = {}
    handlers.forEach((handler, i) => inputProps[`on${handler}`] = spies[i] = jest.fn())
    const tree = mount(AutocompleteComponentJSX({ inputProps }))
    handlers.forEach((handler, i) => {
      tree.find('input').simulate(handler.toLowerCase())
      expect(spies[i]).toHaveBeenCalledTimes(1)
      expect(spies[i].mock.calls[0][0]).toBeDefined()
    })
  })

  it('should not invoke onBlur and/or onFocus when selecting an item from the menu', () => {
    const onBlurSpy = jest.fn()
    const onFocusSpy = jest.fn()
    const onSelectSpy = jest.fn()
    const tree = mount(AutocompleteComponentJSX({
      inputProps: {
        onBlur: onBlurSpy,
        onFocus: onFocusSpy,
      },
      onSelect: onSelectSpy,
      open: true,
    }))
    tree.find('div > div').at(0).simulate('mouseEnter')
    tree.find('input').at(0).simulate('blur')
    tree.find('div > div > div').at(0).simulate('click')
    expect(onBlurSpy).not.toHaveBeenCalled()
    expect(onFocusSpy).not.toHaveBeenCalled()
    expect(onSelectSpy).toHaveBeenCalledTimes(1)
  })

  it('should select value on blur when selectOnBlur=true and highlightedIndex is not null', () => {
    const onSelect = jest.fn()
    const tree = mount(AutocompleteComponentJSX({
      selectOnBlur: true,
      onSelect,
    }))
    tree.find('input').at(0).simulate('focus')
    tree.setProps({ value: 'ma' })
    tree.setState({ highlightedIndex: 3 }) // Massachusetts
    tree.find('input').at(0).simulate('blur')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('Massachusetts', getStates()[20])
  })

  it('should not select value on blur when selectOnBlur=false', () => {
    const onSelect = jest.fn()
    const tree = mount(AutocompleteComponentJSX({
      selectOnBlur: false,
      onSelect,
    }))
    tree.find('input').at(0).simulate('focus')
    tree.setProps({ value: 'ma' })
    tree.setState({ highlightedIndex: 3 }) // Massachusetts
    tree.find('input').at(0).simulate('blur')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should not select value on blur when selectOnBlur=true and highlightedIndex=null ', () => {
    const onSelect = jest.fn()
    const tree = mount(AutocompleteComponentJSX({
      selectOnBlur: false,
      onSelect,
    }))
    tree.find('input').at(0).simulate('focus')
    tree.setProps({ value: 'ma' })
    tree.setState({ highlightedIndex: null })
    tree.find('input').at(0).simulate('blur')
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('focus management', () => {
  it('should preserve focus when clicking on a menu item', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    const ac = tree.instance()
    const input = tree.find('input')
    input.simulate('focus')
    ac.refs.input.focus = jest.fn(() => input.simulate('focus'))
    expect(tree.state('isOpen')).toBe(true)
    const menu = tree.find('div > div').at(0)
    menu.simulate('mouseEnter')
    expect(ac._ignoreBlur).toBe(true)
    input.simulate('blur')
    expect(tree.state('isOpen')).toBe(true)
    const items = tree.find('div > div > div')
    items.at(3).simulate('click')
    expect(ac.refs.input.focus).toHaveBeenCalledTimes(1)
    expect(tree.state('isOpen')).toBe(false)
    expect(ac._ignoreBlur).toBe(false)
  })

  it('...even if `input.focus()` happens async (IE)', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    const ac = tree.instance()
    const input = tree.find('input')
    input.simulate('focus')
    ac.refs.input.focus = jest.fn()
    expect(tree.state('isOpen')).toBe(true)
    const menu = tree.find('div > div').at(0)
    menu.simulate('mouseEnter')
    expect(ac._ignoreBlur).toBe(true)
    input.simulate('blur')
    expect(tree.state('isOpen')).toBe(true)
    const items = tree.find('div > div > div')
    items.at(3).simulate('click')
    expect(ac.refs.input.focus).toHaveBeenCalledTimes(1)
    expect(ac._ignoreFocus).toBe(true)
    input.simulate('focus')
    expect(tree.state('isOpen')).toBe(false)
    expect(ac._ignoreBlur).toBe(false)
    expect(ac._ignoreFocus).toBe(false)
  })

  it('should preserve focus when clicking on non-item elements in the menu', () => {
    const tree = mount(AutocompleteComponentJSX({
      renderMenu: items => <div><span />{items}</div>,
    }))
    const ac = tree.instance()
    const input = tree.find('input')
    input.simulate('focus')
    ac.refs.input.focus = jest.fn(() => input.simulate('focus'))
    expect(tree.state('isOpen')).toBe(true)
    const menu = tree.find('div > div').at(0)
    menu.simulate('mouseEnter')
    expect(ac._ignoreBlur).toBe(true)
    input.simulate('blur')
    expect(tree.state('isOpen')).toBe(true)
    const nonItem = tree.find('span')
    nonItem.simulate('click')
    expect(ac.refs.input.focus).toHaveBeenCalledTimes(1)
    expect(tree.state('isOpen')).toBe(true)
    expect(ac._ignoreBlur).toBe(true)
  })

  it('should save scroll position on blur', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    const ac = tree.instance()
    expect(ac._scrollOffset).toBe(null)
    ac._ignoreBlur = true
    ac.handleInputBlur()
    expect(ac._scrollOffset).toEqual(expect.any(Object))
    expect(ac._scrollOffset.x).toEqual(expect.any(Number))
    expect(ac._scrollOffset.y).toEqual(expect.any(Number))
  })

  it('should restore scroll position on focus reset', () => {
    jest.spyOn(window, 'scrollTo')
    const tree = mount(AutocompleteComponentJSX({}))
    const ac = tree.instance()
    ac._ignoreFocus = true
    ac._scrollOffset = { x: 1, y: 2 }
    const timer = {}
    ac._scrollTimer = timer
    ac.handleInputFocus()
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).toHaveBeenCalledWith(1, 2)
    expect(clearTimeout).toHaveBeenCalledTimes(1)
    expect(clearTimeout).toHaveBeenCalledWith(timer)
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(ac._scrollTimer).toEqual(expect.any(Number))
    expect(ac._scrollOffset).toBe(null)
    jest.runAllTimers()
    expect(window.scrollTo).toHaveBeenCalledTimes(2)
    expect(window.scrollTo).toHaveBeenLastCalledWith(1, 2)
    expect(ac._scrollTimer).toBe(null)
  })

  it('should clear any pending scroll timers on unmount', () => {
    const tree = mount(AutocompleteComponentJSX({}))
    const ac = tree.instance()
    ac._scrollTimer = 42
    tree.unmount()
    expect(ac._scrollTimer).toBe(null)
    expect(clearTimeout).toHaveBeenCalledTimes(1)
    expect(clearTimeout).toHaveBeenCalledWith(42)
  })
})

// Event handler unit tests

describe('Autocomplete keyPress-><character> event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should pass updated `input.value` to `onChange` and replace with `props.value`', done => {

    let value = ''
    autocompleteWrapper.setProps({ value, onChange(_, v) { value = v } })

    autocompleteInputWrapper.get(0).value = 'a'
    autocompleteInputWrapper.simulate('keyPress', { key : 'a', keyCode: 97, which: 97 })
    autocompleteInputWrapper.simulate('change')

    expect(autocompleteInputWrapper.get(0).value).toEqual('')
    expect(value).toEqual('a')
    done()
  })
})

describe('Autocomplete keyDown->ArrowDown event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should highlight the 1st item in the menu when none is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })
    autocompleteWrapper.setState({ 'highlightedIndex': null })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowDown', keyCode: 40, which: 40 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0)
  })

  it('should highlight the "n+1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })

    const n = 4
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } })
    autocompleteWrapper.setState({ 'highlightedIndex': n })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowDown', keyCode: 40, which: 40 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n+1)
  })

  it('should highlight the 1st item in the menu when the last is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })

    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } })
    autocompleteWrapper.setState({ 'highlightedIndex': 49 })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowDown', keyCode: 40, which: 40 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(0)
  })

  it('should not select anything if there are no selectable items', () => {
    autocompleteWrapper.setState({
      isOpen: true,
      highlightedIndex: null,
    })
    autocompleteWrapper.setProps({ isItemSelectable: () => false })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowDown', keyCode: 40, which: 40 })

    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)
  })

})

describe('Autocomplete keyDown->ArrowUp event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should highlight the last item in the menu when none is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })
    autocompleteWrapper.setState({ 'highlightedIndex': null })
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49)
  })

  it('should highlight the "n-1" item in the menu when "n" is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })

    const n = 4
    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } })
    autocompleteWrapper.setState({ 'highlightedIndex': n })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(n-1)
  })

  it('should highlight the last item in the menu when the 1st is selected', () => {
    autocompleteWrapper.setState({ 'isOpen': true })

    // Set input to be an empty value, which displays all 50 states as items in the menu
    autocompleteInputWrapper.simulate('change', { target: { value: '' } })
    autocompleteWrapper.setState({ 'highlightedIndex': 0 })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 })

    expect(autocompleteWrapper.state('isOpen')).toBe(true)
    expect(autocompleteWrapper.state('highlightedIndex')).toEqual(49)
  })

  it('should not select anything if there are no selectable items', () => {
    autocompleteWrapper.setState({
      isOpen: true,
      highlightedIndex: null,
    })
    autocompleteWrapper.setProps({ isItemSelectable: () => false })

    autocompleteInputWrapper.simulate('keyDown', { key : 'ArrowUp', keyCode: 38, which: 38 })

    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)
  })

})

describe('Autocomplete keyDown->Enter event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should do nothing if the menu is closed', () => {
    autocompleteWrapper.setState({ 'isOpen': false })
    autocompleteWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 })
    expect(autocompleteWrapper.state('isOpen')).toBe(false)
  })

  it('should close menu if input has focus but no item has been selected and then the Enter key is hit', () => {
    let value = ''
    autocompleteWrapper.setState({ 'isOpen': true })
    autocompleteInputWrapper.simulate('focus')
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v } })

    // simulate keyUp of backspace, triggering autocomplete suggestion on an empty string, which should result in nothing highlighted
    autocompleteInputWrapper.simulate('keyUp', { key : 'Backspace', keyCode: 8, which: 8 })
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)

    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13 })

    expect(value).toEqual('')
    expect(autocompleteWrapper.state('isOpen')).toBe(false)

  })

  it('should invoke `onSelect` with the selected menu item and close the menu', () => {
    let value = 'Ar'
    let defaultPrevented = false
    autocompleteWrapper.setState({ 'isOpen': true })
    autocompleteInputWrapper.simulate('focus')
    autocompleteWrapper.setProps({ value, onSelect(v) { value = v } })

    // simulate keyUp of last key, triggering autocomplete suggestion + selection of the suggestion in the menu
    autocompleteInputWrapper.simulate('keyUp', { key : 'r', keyCode: 82, which: 82 })

    // Hit enter, updating state.value with the selected Autocomplete suggestion
    autocompleteInputWrapper.simulate('keyDown', { key : 'Enter', keyCode: 13, which: 13, preventDefault() { defaultPrevented = true } })
    expect(value).toEqual('Arizona')
    expect(autocompleteWrapper.state('isOpen')).toBe(false)
    expect(defaultPrevented).toBe(true)

  })

  it('should do nothing if `keyCode` is not 13', () => {
    const onSelect = jest.fn()
    const tree = mount(AutocompleteComponentJSX({
      onSelect,
    }))
    tree.setState({ isOpen: true })
    tree.find('input').simulate('keyDown', { key : 'Enter', keyCode: 229 })
    expect(tree.state('isOpen')).toBe(true)
    expect(onSelect).not.toHaveBeenCalled()
    tree.setState({ highlightedIndex: 1 })
    tree.find('input').simulate('keyDown', { key : 'Enter', keyCode: 229 })
    expect(tree.state('isOpen')).toBe(true)
    expect(onSelect).not.toHaveBeenCalled()
  })

})

describe('Autocomplete keyDown->Escape event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should unhighlight any selected menu item + close the menu', () => {
    autocompleteWrapper.setState({ 'isOpen': true })
    autocompleteWrapper.setState({ 'highlightedIndex': 0 })

    autocompleteInputWrapper.simulate('keyDown', { key : 'Escape', keyCode: 27, which: 27 })

    expect(autocompleteWrapper.state('isOpen')).toBe(false)
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)
  })

})

describe('Autocomplete keyDown', () => {
  it('should not clear highlightedIndex for keys that don\'t modify `input.value`', () => {
    const tree = mount(AutocompleteComponentJSX({ open: true }))
    const input = tree.find('input')
    tree.setProps({ value: 'a' })
    expect(tree.state('highlightedIndex')).toBe(0)
    input.simulate('keyDown', { key : 'ArrowLeft', keyCode: 37, which: 37 })
    input.simulate('keyUp', { key : 'ArrowLeft', keyCode: 37, which: 37 })
    expect(tree.state('highlightedIndex')).toBe(0)
    input.simulate('keyDown', { key : 'ArrowRight', keyCode: 39, which: 39 })
    input.simulate('keyUp', { key : 'ArrowRight', keyCode: 39, which: 39 })
    expect(tree.state('highlightedIndex')).toBe(0)
    input.simulate('keyDown', { key : 'Control', keyCode: 17, which: 17, ctrlKey: true })
    input.simulate('keyUp', { key : 'Control', keyCode: 17, which: 17, ctrlKey: true })
    expect(tree.state('highlightedIndex')).toBe(0)
    input.simulate('keyDown', { key : 'Alt', keyCode: 18, which: 18, altKey: true })
    input.simulate('keyUp', { key : 'Alt', keyCode: 18, which: 18, altKey: true })
    expect(tree.state('highlightedIndex')).toBe(0)
  })
})

describe('Autocomplete mouse event handlers', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))
  const autocompleteInputWrapper = autocompleteWrapper.find('input')

  it('should open menu if it is closed when clicking in the input', () => {
    expect(autocompleteWrapper.state('isOpen')).toBe(false)
    autocompleteWrapper.get(0).isInputFocused = jest.fn(() => true)
    autocompleteInputWrapper.simulate('click')
    expect(autocompleteWrapper.state('isOpen')).toBe(true)
  })

  it('should set `highlightedIndex` when hovering over items in the menu', () => {
    const tree = mount(AutocompleteComponentJSX({ open: true }))
    const items = tree.find('div > div > div')
    expect(tree.state('highlightedIndex')).toBe(null)
    items.at(0).simulate('mouseEnter')
    expect(tree.state('highlightedIndex')).toBe(0)
    items.at(2).simulate('mouseEnter')
    expect(tree.state('highlightedIndex')).toBe(2)
  })

  it('should select an item when clicking on an item in the menu', () => {
    let selected
    const tree = mount(AutocompleteComponentJSX({
      open: true,
      onSelect(value, item) { selected = item },
    }))
    const item = tree.find('div > div > div').at(3)
    item.simulate('click')
    expect(selected).toEqual(getStates()[3])
  })
})

describe('Autocomplete.props.renderInput', () => {
  it('should be invoked in `render` to create the <input> element', () => {
    const renderInput = jest.fn(props => {
      expect(props).toMatchSnapshot()
      return (
        <div>
          <input
            {...props}
            autoComplete="on"
          />
        </div>
      )
    })
    const tree = shallow(AutocompleteComponentJSX({
      value: 'pants',
      inputProps: {
        foo: 'bar',
      },
      renderInput,
    }))
    expect(renderInput).toHaveBeenCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})

// Component method unit tests
describe('Autocomplete#renderMenu', () => {

  const autocompleteWrapper = mount(AutocompleteComponentJSX({}))

  it('should return a <div ref="menu"> ReactComponent when renderMenu() is called', () => {
    //autocompleteInputWrapper.simulate('change', { target: { value: 'Ar' } })
    const autocompleteMenu = autocompleteWrapper.instance().renderMenu()
    expect(autocompleteMenu.type).toEqual('div')
    expect(typeof autocompleteMenu.ref).toEqual('function')
    expect(autocompleteMenu.props.children.length).toEqual(50)
  })

  it('should return a menu ReactComponent with a subset of children when partial match text has been entered', () => {
    // Input 'Ar' should result in 6 items in the menu, populated from autocomplete.
    autocompleteWrapper.setProps({ value: 'Ar' })

    const autocompleteMenu = autocompleteWrapper.instance().renderMenu()
    expect(autocompleteMenu.props.children.length).toEqual(6)

  })

  it('should allow using custom components', () => {
    class Menu extends React.Component {
      render() {
        return <div>{this.props.items}</div>
      }
    }
    class Item extends React.Component {
      render() {
        return <div>{this.props.item.name}</div>
      }
    }
    const wrapper = mount(AutocompleteComponentJSX({
      renderMenu(items) {
        return <Menu items={items} />
      },
      renderItem(item) {
        return <Item key={item.abbr} item={item} />
      }
    }))
    wrapper.setState({ isOpen: true, highlightedIndex: 0 })
    expect(wrapper.find(Menu).length).toBe(1)
    expect(wrapper.find(Item).length).toBe(50)
  })
})

describe('Autocomplete isItemSelectable', () => {
  const autocompleteWrapper = mount(AutocompleteComponentJSX({
    open: true,
    items: getCategorizedStates(),
    isItemSelectable: item => !item.header
  }))

  it('should automatically highlight the first selectable item', () => {
    // Inputting 'ne' will cause Nevada to be the first selectable state to show up under the header 'West'
    // The header (index 0) is not selectable, so should not be automatically highlighted.
    autocompleteWrapper.setProps({ value: 'ne' })
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(1)
  })

  it('should automatically highlight the next available item', () => {
    // After inputting 'new h' to get New Hampshire you have a list that looks like:
    // [ header, header, header, header, New Hampshire, ... ]
    // This test makes sure that New Hampshire is selected, at index 4.
    // (maybeAutocompleteText should skip over the headers correctly)
    autocompleteWrapper.setProps({ value: 'new h' })
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(4)
  })

  it('should highlight nothing automatically if there are no selectable items', () => {
    // No selectable results should appear in the results, only headers.
    // As a result there should be no highlighted index.
    autocompleteWrapper.setProps({ value: 'new hrhrhhrr' })
    expect(autocompleteWrapper.state('highlightedIndex')).toBe(null)
  })
})

describe('Public imperative API', () => {
  it('should expose select APIs available on HTMLInputElement', () => {
    const tree = mount(AutocompleteComponentJSX({ value: 'foo' }))
    const ac = tree.get(0)
    expect(typeof ac.focus).toBe('function')
    expect(ac.isInputFocused()).toBe(false)
    ac.focus()
    expect(ac.isInputFocused()).toBe(true)
    expect(typeof ac.setSelectionRange).toBe('function')
    ac.setSelectionRange(1, 2)
    expect(tree.find('input').get(0).selectionStart).toBe(1)
    expect(tree.find('input').get(0).selectionEnd).toBe(2)
    expect(typeof ac.blur).toBe('function')
    ac.blur()
    expect(ac.isInputFocused()).toBe(false)
  })
})
