import React from '../../packages/react/index.js'

function Count ({ num }) {
  return (
    <div>count: { num }</div>
  )
}

export function App() { 
  return (
    <div class="app">
      <h1>hello world</h1>
      <div>hi</div>
      <Count num={100}></Count>
      <Count num={200}></Count>
    </div>
  )
}
