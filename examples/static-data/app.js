import React from 'react'
import { getStates, matchStateToTerm, sortStates, styles } from '../utils'
import Autocomplete from '../../lib/index'

let App = React.createClass({
  render () {
    return (
      <div>
        <h1>Basic Example with Static Data</h1>

        <p>
          When using static data, you use the client to sort and filter the items,
          so <code>Autocomplete</code> has methods baked in to help.
        </p>

        <Autocomplete
          initialValue="Ma"
          labelText="Choose a state from the US"
          items={getStates()}
          getItemValue={(item) => item.name}
          shouldItemRender={matchStateToTerm}
          sortItems={sortStates}
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

React.render(<App/>, document.getElementById('container'))

