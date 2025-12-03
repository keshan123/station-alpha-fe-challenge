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

2. **Technical Approach**: What debugging tools and techniques did you use to identify and fix the bugs?

3. **Code Improvements**: Beyond fixing bugs, did you make any improvements to the code organization or structure? If so, what and why?

4. **Future Prevention**: How would you prevent similar bugs in future development? Consider both coding practices and testing strategies.

5. **Learning**: What was the most challenging or interesting aspect of this bug-hunting exercise? 