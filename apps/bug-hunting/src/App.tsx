import { useState } from 'react'
import './App.css'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import TodoFilter from './components/TodoFilter'

const App = () => {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState()
  
  const addTodo = (text) => {
    const newTodo = { id: Date.now(), text, completed: false }
    setTodos([...todos, newTodo])
  }
  
  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }
      }
      return todo
    })
    setTodos(updatedTodos)
  }
  
  const deleteTodo = (id) => {
    const remainingTodos = todos.filter(todo => {
      return todo.id !== id
    })
    setTodos(remainingTodos)
  }
  
  const filteredTodos = () => {
    if (filter === 'active') {
      return todos.filter(todo => !todo.completed)
    } else if (filter === 'completed') {
      return todos.filter(todo => todo.completed)
    }
    return todos
  }
  
  function clearCompleted() {
    const activeTodos = todos.filter(todo => !todo.completed)
    setTodos(activeTodos)
  }
  
  return (
    <div className="app">
      <h1>Todo App</h1>
      
      <TodoForm onAdd={addTodo} />
      
      <TodoList 
        todos={filteredTodos()} 
        onToggle={toggleTodo} 
        onDelete={deleteTodo} 
      />
      
      <TodoFilter filter={filter} onFilter={setFilter} onClearCompleted={clearCompleted} />
    </div>
  )
}

export default App
