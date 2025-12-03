import { useState } from 'react'

const TodoForm = ({ onAdd }) => {
  const [input, setInput] = useState("")

  const handleSubmit = (e) => {
    onAdd(input)
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new todo"
      />
      <button type="submit">Add Todo</button>
    </form>
  )
}

export default TodoForm 