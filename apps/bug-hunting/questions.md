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

2. **Technical Approach**: What debugging tools and techniques did you use to identify and fix the bugs?

3. **Code Improvements**: Beyond fixing bugs, did you make any improvements to the code organization or structure? If so, what and why?

4. **Future Prevention**: How would you prevent similar bugs in future development? Consider both coding practices and testing strategies.

5. **Learning**: What was the most challenging or interesting aspect of this bug-hunting exercise? 