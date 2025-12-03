import { useState } from 'react'
import './App.css'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import TodoFilter from './components/TodoFilter'

const App = () => {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState()
  
  const addTodo = (text) => {
    todos.push({ text, completed: false })
    setTodos(todos)
  }
  
  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id == id) {
        todo.completed = !todo.completed
        return todo
      }
      return todo
    })
    setTodos(updatedTodos)
  }
  
  const deleteTodo = () => {
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
      
      <TodoForm />
      
      <TodoList 
        todos={filteredTodos()} 
        onToggle={toggleTodo} 
        onDelete={deleteTodo} 
      />
      
      <TodoFilter filter={filter} onClearCompleted={clearCompleted} />
    </div>
  )
}

export default App
