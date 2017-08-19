import React from 'react'
import DOM from 'react-dom'
import { getStates, matchStateToTerm, sortStates } from '../../lib/utils'
import Autocomplete from '../../lib/index'

class App extends React.Component {
  state = { value: 'Ma' }
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
          inputProps={{ id: 'states-autocomplete' }}
          wrapperStyle={{ position: 'relative', display: 'inline-block' }}
          items={getStates()}
          getItemValue={(item) => item.name}
          shouldItemRender={matchStateToTerm}
          sortItems={sortStates}
          onChange={(event, value) => this.setState({ value })}
          onSelect={value => this.setState({ value })}
          renderMenu={children => (
            <div className="menu">
              {children}
            </div>
          )}
          renderItem={(item, isHighlighted) => (
            <div
              className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
              key={item.abbr}
            >{item.name}</div>
          )}
        />
      </div>
    )
  }
}

DOM.render(<App/>, document.getElementById('container'))

if (module.hot) { module.hot.accept() }
