const TodoFilter = ({ filter, onFilter, onClearCompleted }) => {
  const handleFilterChange = (newFilter) => {
    onFilter(newFilter)
  }
  
  return (
    <div className="todo-filter">
      <div className="filter-buttons">
        <button 
          className={filter === "all" && "active"} 
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        <button 
          className={`${filter === "active" ? "active" : ""}`} 
          onClick={() => handleFilterChange("active")}
        >
          Active
        </button>
        <button 
          className={filter == "completed" ? "active" : ""} 
          onClick={() => handleFilterChange("completed")}
        >
          Completed
        </button>
      </div>
      
      <button 
        className="clear-completed"
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    </div>
  )
}
export default TodoFilter 