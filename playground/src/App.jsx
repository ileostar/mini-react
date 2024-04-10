import React, { useEffect, useState } from 'mini-react'

function List() {
  const [inputValue, setInputValue] = useState('');
  const [filterVal, setFilterVal] = useState('all');
  const [todolist, setTodolist] = useState([]);

  useEffect(() => {
    setFilterVal(localStorage.getItem('filterVal') ?? 'all')
    setTodolist(localStorage.getItem('todolist') ? JSON.parse(localStorage.getItem('todolist')) : [])
  }, [])

  function handleAdd() {
    if(!inputValue) return
    addTodo(inputValue)
    setInputValue('')
  }

  function createTodo(itemName) {
    return { title: itemName, id: crypto.randomUUID(), done: false };
  }
  function addTodo(val) {
    setTodolist((todolist)=> [...todolist, createTodo(val)])
  }

  function removeTodo(idx) {
    setTodolist((todolist)=> todolist.filter(todo=> todo.id !== idx))
  }

  function saveTodo() {
    localStorage.setItem('filterVal', filterVal)
    localStorage.setItem('todolist', JSON.stringify(todolist))
  }

  function doneTodo(idx) {
    setTodolist((todolist)=> todolist.map(todo=> (
        todo.id === idx ? {...todo, done: !todo.done} : todo)
      ))
  }

  let renderList = todolist.filter(todo => {
    if(filterVal === 'all') return true
    return filterVal === 'done' ? todo.done : !todo.done
  }).map(todo => (
    <TodoItem
      key={todo.id}
      todo={todo}
      removeTodo={removeTodo}
      doneTodo={doneTodo}
    />
  ));

  return (
    <div className='flex flex-col items-center bg-red-200/30 border-red-200/100 border-solid border-2 border-rd-5 w-[350px] p5 m5'>
      <div className='flex gap-1 h-7'>
        <input className='bg-white/30 p-0.5 px-2 border-solid border-1.5  border-rd-3 border-gray-500/30' value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='please input add todo list' />
        <button className='btn' onClick={() => handleAdd()}>add</button>
        <button className='btn' onClick={() => saveTodo()}>save</button>
      </div>
      <div className='flex my-2'>
        <div>
          <input className='m-1' type="radio" id="all" name="drone" value="all" checked={filterVal === 'all'} onClick={() => setFilterVal('all')} />
          <label for="all">all</label>
        </div>
        <div>
          <input className='m-1' type="radio" id="done" name="drone" value="done" checked={filterVal === 'done'}  onClick={() => setFilterVal('done')} />
          <label for="done">done</label>
        </div>
        <div>
          <input className='m-1' type="radio" id="active" name="drone" value="active" checked={filterVal === 'active'} onClick={() => setFilterVal('active')} />
          <label for="active">active</label>
        </div>
      </div>
      <ul className='w-full px-5 flex flex-col gap-2'>
        { ...renderList }
      </ul>
    </div>
  );


  function TodoItem({todo, removeTodo, doneTodo}) {
    function classNameCSS(done) {
      return done ? 'flex-1 btn bg-white/30 p-0.5 px-2 line-through': 'flex-1 btn bg-white/30 p-0.5 px-2'
    }
    return <li className='w-full h-7 list-none flex gap-1' key={todo.id}>
      <p className={classNameCSS(todo.done)}>{todo.title}</p>
      <button className='btn' type='button' onClick={() => removeTodo(todo.id)}>remove</button>
      <button className='btn' onClick={() => doneTodo(todo.id)}>{todo.done ? 'cancel' : 'done'}</button>
    </li>;
  }
}

export function App() {
  return (
    <div className='w-full h-full flex flex-col items-center'>
      <h1 className='color-red mt-5'>TodoList</h1>
      <List></List>
    </div>
  );
}
