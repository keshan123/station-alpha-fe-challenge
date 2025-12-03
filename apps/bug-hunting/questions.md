# Bug Hunting Challenge - Questions

Please answer the following questions about the bugs you identified and fixed:

1. **Bug Overview**: List the bugs you found and fixed. For each bug, briefly describe:
   - What was the issue?
   - How did you identify it?
   - How did you fix it?

   **Bug #1: ReferenceError in TodoForm.tsx**
   - **What was the issue?**: On line 15 of `TodoForm.tsx`, there was a `ReferenceError: e is not defined`. The `onChange` handler was written as `onChange={setInput(e.target.value)}`, which attempted to reference `e` (the event object) outside of a function scope where it doesn't exist.
   - **How did you identify it?**: The error was caught by the browser's runtime error handling, showing "Uncaught ReferenceError: e is not defined at TodoForm (TodoForm.tsx:15:28)" in the console.
   - **How did you fix it?**: Changed the `onChange` handler from `onChange={setInput(e.target.value)}` to `onChange={(e) => setInput(e.target.value)}`. This wraps the call in an arrow function that properly receives the event parameter `e`, making it available in the correct scope.

   **Bug #2: TypeError in TodoList.tsx**
   - **What was the issue?**: On line 4 of `TodoList.tsx`, there was a `TypeError: Cannot read properties of null (reading 'map')`. The `todos` prop was `null` because in `App.tsx` line 8, the `todos` state was initialized as `null` instead of an empty array. When `TodoList` tried to call `todos.map()`, it failed because `null` doesn't have a `map` method.
   - **How did you identify it?**: The error was caught by the browser's runtime error handling, showing "Uncaught TypeError: Cannot read properties of null (reading 'map') at TodoList (TodoList.tsx:4:14)" in the console.
   - **How did you fix it?**: Changed the initial state in `App.tsx` from `useState(null)` to `useState([])`. This initializes `todos` as an empty array, which has the `map` method and prevents the error. An empty array is also the correct initial value for a list that will be populated with todo items.

   **Bug #3: ReferenceError in TodoFilter.tsx**
   - **What was the issue?**: On line 16 of `TodoFilter.tsx`, there was a `ReferenceError: active is not defined`. The code was comparing `filter === active` where `active` was referenced as a variable instead of the string literal `"active"`. JavaScript was trying to find a variable named `active` which doesn't exist in that scope.
   - **How did you identify it?**: The error was caught by the browser's runtime error handling, showing "Uncaught ReferenceError: active is not defined at TodoFilter (TodoFilter.tsx:16:36)" in the console.
   - **How did you fix it?**: Changed `filter === active` to `filter === "active"` by adding quotes around `active` to make it a string literal. This correctly compares the `filter` prop value to the string `"active"` instead of trying to reference an undefined variable.

   **Bug #4: Infinite Loop in TodoFilter.tsx**
   - **What was the issue?**: On line 31 of `TodoFilter.tsx`, there was an infinite loop causing "Maximum update depth exceeded" error. The `onClick` handler was written as `onClick={onClearCompleted()}` which immediately calls the function during render instead of passing a function reference. This caused the component to: render → call `clearCompleted()` → update state → re-render → call `clearCompleted()` again → infinite loop.
   - **How did you identify it?**: The error was caught by React's error handling, showing "Maximum update depth exceeded" and "There was an error during concurrent rendering" in the console. The stack trace pointed to `clearCompleted` at `App.tsx:45:5` and `TodoFilter.tsx:31:18`.
   - **How did you fix it?**: Changed `onClick={onClearCompleted()}` to `onClick={onClearCompleted}`. This passes a function reference to the `onClick` handler instead of calling the function immediately. Now the function is only called when the button is actually clicked, not on every render.

   **Bug #5: Invalid className Attribute in TodoFilter.tsx**
   - **What was the issue?**: On line 10 of `TodoFilter.tsx`, there was a warning about receiving `false` for a non-boolean attribute `className`. The code used `className={filter === "all" && "active"}`, which when the condition is false, evaluates to `false` (a boolean) instead of a string. React expects className to be a string, not a boolean value.
   - **How did you identify it?**: The error was caught by React's development mode warnings, showing "Received `false` for a non-boolean attribute `className`" in the console. React suggested using a ternary operator instead of the `&&` pattern for conditional className values.
   - **How did you fix it?**: Changed `className={filter === "all" && "active"}` to `className={filter === "all" ? "active" : ""}`. This uses a ternary operator that always returns a string (either `"active"` or an empty string `""`), ensuring className always receives a valid string value instead of a boolean.

   **Bug #6: Input Placeholder Showing "0" in TodoForm.tsx**
   - **What was the issue?**: The input field in `TodoForm.tsx` was displaying "0" instead of showing the placeholder text "Add a new todo". This happened because on line 4, the input state was initialized with `useState(0)` (a number) instead of an empty string. When a controlled input has a non-empty value (even if it's the number 0), React displays that value and the placeholder is hidden.
   - **How did you identify it?**: This was identified through visual inspection - the input field showed "0" instead of the expected placeholder text when the component first rendered.
   - **How did you fix it?**: Changed `useState(0)` to `useState("")` on line 4. This initializes the input state as an empty string, which is the correct type for a text input. When the value is an empty string, React properly displays the placeholder text instead of showing a value.

   **Bug #7: Missing id/name Attributes in TodoForm.tsx**
   - **What was the issue?**: The input field in `TodoForm.tsx` was missing both `id` and `name` attributes. This is a best practice violation that can prevent browsers from correctly autofilling forms, and it also impacts accessibility and form handling. The `name` attribute is particularly important for form submission and browser autofill functionality.
   - **How did you identify it?**: This was identified through a browser warning message: "A form field element has neither an id nor a name attribute. This might prevent the browser from correctly autofilling the form."
   - **How did you fix it?**: Added both `name="todo"` and `id="todo-input"` attributes to the input element. The `name` attribute allows the browser to identify the field for autofill, and the `id` attribute provides a unique identifier for accessibility and potential label association.

   **Bug #8: Adding New Tasks Fails in TodoForm.tsx and App.tsx**
   - **What was the issue?**: Multiple issues prevented adding new tasks: (1) `TodoForm` component was rendered without the required `onAdd` prop in `App.tsx` line 52, causing `onAdd` to be `undefined` when called on line 7 of `TodoForm.tsx`. (2) The `handleSubmit` function didn't prevent default form submission, causing page refreshes. (3) The `addTodo` function in `App.tsx` was mutating the todos array directly with `todos.push()`, which violates React's immutability principle and may not trigger re-renders. (4) New todos were missing `id` properties, which are needed for toggle and delete operations.
   - **How did you identify it?**: This was identified when attempting to add a new task - the form submission failed, likely throwing an error because `onAdd` was undefined. Testing the add functionality revealed the issue.
   - **How did you fix it?**: Fixed multiple issues: (1) Added `onAdd={addTodo}` prop to `<TodoForm />` in `App.tsx`. (2) Added `e.preventDefault()` in `handleSubmit` to prevent form submission and page refresh, and added input validation and clearing. (3) Changed `addTodo` to use immutable state update: `setTodos([...todos, newTodo])` instead of mutating the array. (4) Added `id: Date.now()` to new todos to ensure each todo has a unique identifier.

2. **Technical Approach**: What debugging tools and techniques did you use to identify and fix the bugs?

3. **Code Improvements**: Beyond fixing bugs, did you make any improvements to the code organization or structure? If so, what and why?

4. **Future Prevention**: How would you prevent similar bugs in future development? Consider both coding practices and testing strategies.

5. **Learning**: What was the most challenging or interesting aspect of this bug-hunting exercise? 