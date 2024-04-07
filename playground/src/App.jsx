import React from 'mini-react'

let showBar = false
function Counter () {
  function Foo() {
    return <div>foo</div>
  }
  function Bar() {
    return (
      <div>
        bar
        <div>111</div>
      </div>
    )
  }
  function handleClick () {
    showBar = !showBar
    React.update()
  }
  return (
    <div>
      Counter
      {showBar && <Foo/>}
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
