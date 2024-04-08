import React, { useState } from 'mini-react'

function Foo() {
  console.log("re foo")
  const [count, setCount] = React.useState(10);
  const [bar, setBar] = React.useState("bar");
  function handleClick() {
    setCount((c) => c + 1);
    setBar("foo");
  }

  return (
    <div>
      <h1>foo</h1>
      {count}
      <div>{bar}</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
}

export function App() {
  return (
    <div>
      hi-mini-react
      <Foo></Foo>
    </div>
  );
}
