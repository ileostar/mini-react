import React from 'mini-react'

let showBar = false
function Counter () {
  function Foo() {
    return <div>foo</div>
  }
  function handleClick () {
    showBar = !showBar
    React.update()
  }
  return (
    <div>
      Counter
      <div>{showBar ? 'bar' : <Foo/>}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

export function App() {
  return (
    <div class="app">
      <h1>hello world</h1>
      <div>hi</div>
      <Counter ></Counter>
    </div>
  )
}
