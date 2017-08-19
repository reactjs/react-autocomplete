import React from 'react'
import DOM from 'react-dom'
import Autocomplete from '../../lib/index'
import { getStates, fakeRequest } from '../../lib/utils'

class App extends React.Component {

  state = {
    value: '',
    unitedStates: getStates(),
  }

  requestTimer = null

  render() {
    return (
      <div>
        <h1>Async Data</h1>
        <p>
          Autocomplete works great with async data by allowing you to pass in
          items. The <code>onChange</code> event provides you the value to make
          a server request with, then change state and pass in new items, it will
          attempt to autocomplete the first one.
        </p>
        <label htmlFor="states-autocomplete">Choose a state from the US</label>
        <Autocomplete
          inputProps={{ id: 'states-autocomplete' }}
          wrapperStyle={{ position: 'relative', display: 'inline-block' }}
          value={this.state.value}
          items={this.state.unitedStates}
          getItemValue={(item) => item.name}
          onSelect={(value, item) => {
            // set the menu to only the selected item
            this.setState({ value, unitedStates: [ item ] })
            // or you could reset it to a default list again
            // this.setState({ unitedStates: getStates() })
          }}
          onChange={(event, value) => {
            this.setState({ value })
            clearTimeout(this.requestTimer)
            this.requestTimer = fakeRequest(value, (items) => {
              this.setState({ unitedStates: items })
            })
          }}
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
