import React from 'react'
import DOM from 'react-dom'
import { getStates, matchStateToTerm, sortStates, styles } from '../../lib/utils'
import Autocomplete from '../../lib/index'

let App = React.createClass({
  getInitialState() {
    return { value: 'Ma' }
  },
  render() {
    return (
      <div>
        <h1>Basic Example with Static Data</h1>
        <p>
          When using static data, you use the client to sort and filter the items,
          so <code>Autocomplete</code> has methods baked in to help.
        </p>
        <label htmlFor="states-autocomplete">Choose a state from the US</label>
        <Autocomplete
          value={this.state.value}
          inputProps={{ name: 'US state', id: 'states-autocomplete' }}
          items={getStates()}
          getItemValue={(item) => item.name}
          shouldItemRender={matchStateToTerm}
          sortItems={sortStates}
          onChange={(event, value) => this.setState({ value })}
          onSelect={value => this.setState({ value })}
          renderItem={(item, isHighlighted) => (
            <div
              style={isHighlighted ? styles.highlightedItem : styles.item}
              key={item.abbr}
            >{item.name}</div>
          )}
        />
      </div>
    )
  }
})

DOM.render(<App/>, document.getElementById('container'))

if (module.hot) { module.hot.accept() }
