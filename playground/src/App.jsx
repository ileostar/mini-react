import React from '../../packages/react/index.js'

let count = 10;
let props = { id: '1111' }
function Count ({ num }) {
  function handleClick () {
    console.log('clicked')
    props = { id: '2222' }
    count = count + 1
    React.update()
  }
  return (
    <div {...props}>
      <div>count: { count }</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

export function App() {
  return (
    <div class="app">
      <h1>hello world</h1>
      <div>hi</div>
      <Count num={100}></Count>
    </div>
  )
}
