import React, { useState, useEffect } from 'mini-react'

function Foo() {
  console.log("re foo")
  const [count, setCount] = useState(10);
  const [bar, setBar] = useState("bar");
  function handleClick() {
    setCount((c) => c + 1);
    setBar("foo");
  }

  useEffect(() => {
    console.log("effect111")
    return () => {
      console.log("cleanup111")
    }
  }, [11])
  useEffect(() => {
    console.log("effect222")
    return () => {
      console.log("cleanup222")
    }
  }, [count])


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
