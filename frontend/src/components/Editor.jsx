import React, { useEffect, useState } from "react";
import { dracula } from "@codesandbox/sandpack-themes";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
} from "@codesandbox/sandpack-react";

export default function InteractiveEditor() {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        const response = {
          data: {
            generatedFiles: {
              "/App.js": `
import React, { useState } from "react";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";

export default function App() {
  const [todos, setTodos] = useState([]);

  const addTodo = (todo) => {
    setTodos([...todos, todo]);
  };

  return (
    <div>
      <h1>Todo App</h1>
      <AddTodo addTodo={addTodo} />
      <TodoList todos={todos} />
    </div>
  );
}`,
              "/components/TodoList.js": `import React from "react";
import TodoItem from "./TodoItem";

export default function TodoList({ todos }) {
  return (
    <div>
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />
      ))}
    </div>
  );
}`,
              "/components/TodoItem.js": `import React from "react";

export default function TodoItem({ todo }) {
  return <div>{todo}</div>;
}`,
              "/components/AddTodo.js": `import React, { useState } from "react";

export default function AddTodo({ addTodo }) {
  const [newTodo, setNewTodo] = useState("");

  const handleAddClick = () => {
    if (newTodo) {
      addTodo(newTodo);
      setNewTodo("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new todo"
      />
      <button onClick={handleAddClick}>Add</button>
    </div>
  );
}`,
            },
          },
        };

        // In a real app, replace the hardcoded response with an API call
        // const response = await axios.get("YOUR_BACKEND_ENDPOINT");

        setFiles(response.data.generatedFiles);
      } catch (err) {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileStructure();
  }, []);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;

  return (
    <SandpackProvider
      template="react"
      theme={dracula}
      customSetup={{
        dependencies: {
          react: "latest",
          "react-dom": "latest",
          axios: "latest",
          "lucide-react": "latest",
          tailwindcss: "latest",
          "@codesandbox/sandpack-react": "latest",
        },
      }}
      files={files}
    >
      <SandpackLayout
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          overflow: "auto",
          margin: "20px",
        }}
      >
        <SandpackFileExplorer
          style={{ height: "100vh", overflowY: "scroll" }}
        />
        <SandpackCodeEditor closableTabs style={{ height: "100vh" }} />
        <SandpackPreview style={{ height: "100vh" }} theme={"dark"} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
