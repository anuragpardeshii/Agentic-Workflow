import React, { useEffect, useState } from "react";
import StackBlitzSDK from "@stackblitz/sdk";
import sha1 from "sha1";

const Editor = () => {
  const [netlifyToken, setNetlifyToken] = useState("");
  const [siteName, setSiteName] = useState("");

  const deployToNetlify = async () => {
    if (!netlifyToken || !siteName) {
      alert("Please provide your Netlify token and site name.");
      return;
    }

    try {
      // Step 1: Create a new site
      const siteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${netlifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: siteName }),
      });

      if (!siteResponse.ok) {
        const errorData = await siteResponse.json();
        throw new Error(errorData.message || "Failed to create site.");
      }

      const siteData = await siteResponse.json();
      const siteId = siteData.id;

      console.log("Site created:", siteData);

      // Step 2: Prepare files for deployment (only index.html, style.css, and app.js)
      const files = {
        "/index.html": `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Todo App</title>
            <link rel="stylesheet" href="style.css">
          </head>
          <body>
            <div id="app">
              <h1>Todo App</h1>
              <input type="text" id="newTodo" placeholder="Add a new todo">
              <button id="addTodo">Add Todo</button>
              <ul id="todoList"></ul>
            </div>
            <script src="app.js"></script>
          </body>
          </html>`,
        "/style.css": `body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          padding: 20px;
        }`,
        "/app.js": btoa(`document.addEventListener("DOMContentLoaded", () => {
  const newTodoInput = document.getElementById("newTodo");
  const addTodoButton = document.getElementById("addTodo");
  const todoList = document.getElementById("todoList");

  const todos = [];

  // Function to render todos in the list
  function renderTodos() {
    todoList.innerHTML = ""; // Clear the current list
    todos.forEach((todo, index) => {
      const todoItem = document.createElement("li");
      todoItem.textContent = todo;

      // Create a delete button for each todo
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => {
        todos.splice(index, 1); // Remove todo from the array
        renderTodos(); // Re-render the list
      };

      todoItem.appendChild(deleteButton);
      todoList.appendChild(todoItem);
    });
  }

  // Add a new todo
  addTodoButton.onclick = () => {
    const newTodo = newTodoInput.value.trim();
    if (newTodo) {
      todos.push(newTodo); // Add the new todo to the array
      newTodoInput.value = ""; // Clear the input
      renderTodos(); // Re-render the list
    }
  };

  renderTodos(); // Initial render of the empty list
});
`),
      };

      const fileHashes = {};
      for (const file in files) {
        const hash = sha1(files[file]).toString();
        fileHashes[file] = hash;
      }

      // Step 3: Create deploy
      const deployResponse = await fetch(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${netlifyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: { [file]: files[file] } }),
        }
      );

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.message || "Failed to deploy files.");
      }

      const deployData = await deployResponse.json();
      const deployId = deployData.id; // Get the deploy ID for the next steps
      alert(`Deployment started! Deploy ID: ${deployId}`);

      // Step 4: Deploy files individually using PUT method
      const fileDeployments = [
        { file: "/index.html", content: files["/index.html"] },
        { file: "/style.css", content: files["/style.css"] },
        { file: "/app.js", content: files["/app.js"] },
      ];

      for (const { file, content } of fileDeployments) {
        const putResponse = await fetch(
          `https://api.netlify.com/api/v1/deploys/${deployId}/files${file}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }), // Send the raw content here
          }
        );

        if (!putResponse.ok) {
          const errorData = await putResponse.json();
          throw new Error(errorData.message || `Failed to upload ${file}`);
        }

        console.log(`${file} uploaded successfully.`);
      }

      alert("Deployment successful!");
    } catch (error) {
      console.error("Error deploying to Netlify:", error);
      alert(`Error: ${error.message}`);
    }
  };

  //   useEffect(() => {
  //     StackBlitzSDK.embedProject(
  //       "stackblitz-container",
  //       {
  //         files: {
  //           "src/App.js": `import React, { useState } from "react";
  // import TodoList from "../components/TodoList.js";
  // import AddTodo from "../components/AddTodo.js";

  // export default function App() {
  //   const [todos, setTodos] = useState([]);

  //   const addTodo = (todo) => {
  //     setTodos([...todos, todo]);
  //   };

  //   const removeTodo = (index) => {
  //     const updatedTodos = todos.filter((_, i) => i !== index);
  //     setTodos(updatedTodos);
  //   };

  //   return (
  //     <div className="p-10 bg-gray-100 min-h-screen">
  //       <h1 className="text-2xl font-bold text-blue-600 mb-4">Todo App</h1>
  //       <AddTodo addTodo={addTodo} />
  //       <TodoList todos={todos} removeTodo={removeTodo} />
  //     </div>
  //   );
  // }`,
  //           "components/TodoList.js": `import React from "react";
  // import TodoItem from "./TodoItem";

  // export default function TodoList({ todos, removeTodo }) {
  //   return (
  //     <div className="mt-4">
  //       {todos.map((todo, index) => (
  //         <TodoItem key={index} todo={todo} index={index} removeTodo={removeTodo} />
  //       ))}
  //     </div>
  //   );
  // }`,
  //           "components/TodoItem.js": `import React from "react";

  // export default function TodoItem({ todo, index, removeTodo }) {
  //   return (
  //     <div className="flex justify-between items-center p-2 bg-white shadow-md rounded mb-2">
  //       <span>{todo}</span>
  //       <button
  //         onClick={() => removeTodo(index)}
  //         className="text-red-500 hover:text-red-700"
  //       >
  //         Delete
  //       </button>
  //     </div>
  //   );
  // }`,
  //           "components/AddTodo.js": `import React, { useState } from "react";

  // export default function AddTodo({ addTodo }) {
  //   const [newTodo, setNewTodo] = useState("");

  //   const handleAddClick = () => {
  //     if (newTodo) {
  //       addTodo(newTodo);
  //       setNewTodo("");
  //     }
  //   };

  //   return (
  //     <div className="flex gap-2">
  //       <input
  //         type="text"
  //         value={newTodo}
  //         onChange={(e) => setNewTodo(e.target.value)}
  //         placeholder="Add a new todo"
  //         className="p-2 border rounded flex-1"
  //       />
  //       <button
  //         onClick={handleAddClick}
  //         className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
  //       >
  //         Add
  //       </button>
  //     </div>
  //   );
  // }`,
  //         },
  //         template: "create-react-app",
  //         title: "My Project",
  //       },
  //       { height: "100%" }
  //     );
  //   }, []);

  return (
    <div style={{ height: "100vh" }}>
      <div>
        <input
          type="text"
          placeholder="Netlify Token"
          value={netlifyToken}
          onChange={(e) => setNetlifyToken(e.target.value)}
          className="p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Site Name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="p-2 border rounded mb-2"
        />
        <button
          onClick={deployToNetlify}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Deploy to Netlify
        </button>
      </div>
      <div
        id="stackblitz-container"
        style={{ height: "600px", width: "100%" }}
      ></div>
    </div>
  );
};

export default Editor;
