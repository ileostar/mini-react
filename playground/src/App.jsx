import React, { useState, useEffect } from 'mini-react'

function List() {
  const [inputValue, setInputValue] = useState('');
  const [todolist, setTodolist] = useState(localStorage.getItem('todolist') ? JSON.parse(localStorage.getItem('todolist')) : []);
  function addTodo() {
    if(!inputValue) return
    setTodolist((todolist)=> [...todolist, {title: inputValue}])
  }

  function removeTodo(idx) {
    console.log(idx)
    if(idx === todolist.length - 1) {
      setTodolist((todolist)=> todolist.slice(0, idx))
    } else if(idx === 0) {
      setTodolist((todolist)=> todolist.slice(idx + 1))
    } else {
      setTodolist((todolist)=> todolist.slice(0, idx).concat(todolist.slice(idx + 1)))
    }
  }

  function saveTodo() {
    localStorage.setItem('todolist', JSON.stringify(todolist))
  }

  function doneTodo(idx) {
    setTodolist((todolist)=> todolist.map((todo, index)=> (
        index === idx ? {...todo, done: !todo.done} : todo)
      ))
  }

  function classNameCSS(done) {
    return done ? 'flex-1 btn bg-white/30 p-0.5 px-2 line-through': 'flex-1 btn bg-white/30 p-0.5 px-2'
  }

  let renderList = todolist.map((todo, index) => (
    <li className='w-full h-7 list-none flex gap-1' key={index}>
      <p className={classNameCSS(todo.done)}>{todo.title}</p>
      <button className='btn' type='button' onClick={() => removeTodo(index)}>remove</button>
      <button className='btn' onClick={() => doneTodo(index)}>{todo.done ? 'undone' : 'done'}</button>
    </li>
  ))

  return (
    <div className='flex flex-col items-center bg-red-200/30 border-red-200/100 border-solid border-2 border-rd-5 w-[350px] p5 m5'>
      <div className='flex gap-1 h-7'>
        <input className='bg-white/30 p-0.5 px-2 border-solid border-1.5  border-rd-3 border-gray-500/30' value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='please input add todo list' />
        <button className='btn' onClick={addTodo}>add</button>
        <button className='btn' onClick={() => saveTodo()}>save</button>
      </div>
      <div className='flex my-2'>
        <div>
          <input className='m-1' type="radio" id="all" name="drone" value="all" checked />
          <label for="all">all</label>
        </div>
        <div>
          <input className='m-1' type="radio" id="done" name="drone" value="done" />
          <label for="done">done</label>
        </div>
        <div>
          <input className='m-1' type="radio" id="active" name="drone" value="active" />
          <label for="active">active</label>
        </div>
      </div>
      <ul className='w-full px-5 flex flex-col gap-2'>
        { ...renderList }
      </ul>
    </div>
  );
}

export function App() {
  return (
    <div className='w-full h-full flex flex-col items-center'>
      <h1 className='color-red mt-5'>TodoList</h1>
      <List></List>
    </div>
  );
}
