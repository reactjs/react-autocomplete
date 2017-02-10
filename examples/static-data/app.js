import React from 'react'
import DOM from 'react-dom'
import { getStates, matchStateToTerm, sortStates, styles } from '../../lib/utils'
import Autocomplete from '../../lib/index'

let App = React.createClass({
  getInitialState() {
    return { value: 'Ma' }
  },
  render () {
    const { value } = this.state;
    const items = getStates()
      // .filter(item => matchStateToTerm(item, value))
    // items.sort((a, b) => sortStates(a, b, value))
    return (
      <div>
        <h1>Basic Example with Static Data</h1>
        <p>
          When using static data, you use the client to sort and filter the items,
          so <code>Autocomplete</code> has methods baked in to help.
        </p>
        <label htmlFor="states-autocomplete">Choose a state from the US</label>
        <Autocomplete
          value={value}
          id="states-autocomplete"
          items={items}
          shouldHighlightItem={(item, value) => item.name.toLowerCase().indexOf(value.trim().toLowerCase()) === 0}
          onChange={event => this.setState({ value: event.target.value })}
          onSelect={(event, item) => this.setState({ value: item.name })}
          renderMenu={items => <div style={{ maxHeight: 200, overflow: 'scroll', position: 'absolute' }}>{items}</div>}
        >
          {(item, isHighlighted) => (
            <div
              style={isHighlighted ? styles.highlightedItem : styles.item}
              key={item.abbr}
            >{item.name}</div>
          )}
        </Autocomplete>
      </div>
    )
  }
})

DOM.render(<App/>, document.getElementById('container'))

