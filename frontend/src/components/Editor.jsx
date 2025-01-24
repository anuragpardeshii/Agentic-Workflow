import React, { useEffect } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

const Editor = () => {
  useEffect(() => {
    StackBlitzSDK.embedProject(
      "stackblitz-container",
      {
        files: {
          "src/App.js": `import React, { useState } from "react"; 
import TodoList from "../components/TodoList.js"; 
import AddTodo from "../components/AddTodo.js"; 

export default function App() { 
const [todos, setTodos] = useState([]); 

const addTodo = (todo) => { 
setTodos([...todos, todo]); 
}; 

const removeTodo = (index) => {
const updatedTodos = todos.filter((_, i) => i !== index);
setTodos(updatedTodos);
};

return ( 
<div className="p-10 bg-gray-100 min-h-screen"> 
  <h1 className="text-2xl font-bold text-blue-600 mb-4">Todo App</h1> 
  <AddTodo addTodo={addTodo} /> 
  <TodoList todos={todos} removeTodo={removeTodo} /> 
</div> 
); 
}`,

          "components/TodoList.js": `import React from "react"; 
import TodoItem from "./TodoItem"; 

export default function TodoList({ todos, removeTodo }) { 
return ( 
<div className="mt-4"> 
  {todos.map((todo, index) => ( 
    <TodoItem key={index} todo={todo} index={index} removeTodo={removeTodo} /> 
  ))} 
</div> 
); 
}`,

          "components/TodoItem.js": `import React from "react"; 

export default function TodoItem({ todo, index, removeTodo }) { 
return ( 
<div className="flex justify-between items-center p-2 bg-white shadow-md rounded mb-2"> 
  <span>{todo}</span> 
  <button 
    onClick={() => removeTodo(index)} 
    className="text-red-500 hover:text-red-700" 
  > 
    Delete 
  </button> 
</div> 
); 
}`,

          "components/AddTodo.js": `import React, { useState } from "react"; 

export default function AddTodo({ addTodo }) { 
const [newTodo, setNewTodo] = useState(""); 

const handleAddClick = () => { 
if (newTodo) { 
  addTodo(newTodo); 
  setNewTodo(""); 
} 
}; 

return ( 
<div className="flex gap-2"> 
  <input 
    type="text" 
    value={newTodo} 
    onChange={(e) => setNewTodo(e.target.value)} 
    placeholder="Add a new todo" 
    className="p-2 border rounded flex-1" 
  /> 
  <button 
    onClick={handleAddClick} 
    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" 
  > 
    Add 
  </button> 
</div> 
); 
}`,
          "public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive Editor</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
  <div id="root"></div>
  <script type="module" src="src/index.js"></script>
</body>
</html>`,
          "src/index.js": `
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";



createRoot(document.getElementById("root")).render(
      <App />
);

`,
        },

        template: "create-react-app",
        title: "My Project",
      },
      {
        height: "100%",
      }
    );
  }, []);

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <div
        id="stackblitz-container"
        style={{ height: "600px", width: "100%" }}
      ></div>
    </div>
  );
};

export default Editor;
