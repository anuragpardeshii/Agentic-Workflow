import React, { useState } from "react";
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

      // Step 2: Prepare files for deployment
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
        "/app.js": `document.addEventListener("DOMContentLoaded", () => {
          const newTodoInput = document.getElementById("newTodo");
          const addTodoButton = document.getElementById("addTodo");
          const todoList = document.getElementById("todoList");

          const todos = [];

          function renderTodos() {
            todoList.innerHTML = ""; 
            todos.forEach((todo, index) => {
              const todoItem = document.createElement("li");
              todoItem.textContent = todo;

              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              deleteButton.onclick = () => {
                todos.splice(index, 1);
                renderTodos();
              };

              todoItem.appendChild(deleteButton);
              todoList.appendChild(todoItem);
            });
          }

          addTodoButton.onclick = () => {
            const newTodo = newTodoInput.value.trim();
            if (newTodo) {
              todos.push(newTodo);
              newTodoInput.value = "";
              renderTodos();
            }
          };

          renderTodos();
        });`,
      };

      // Step 3: Compute file hashes
      const fileHashes = {};
      for (const file in files) {
        fileHashes[file] = sha1(files[file]).toString();
      }

      // Step 4: Create deploy
      const deployResponse = await fetch(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${netlifyToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: fileHashes }),
        }
      );

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json();
        throw new Error(errorData.message || "Failed to deploy files.");
      }

      const deployData = await deployResponse.json();
      const deployId = deployData.id;

      alert(`Deployment started! Deploy ID: ${deployId}`);

      // Step 5: Upload files via PUT request
      for (const file in files) {
        const putResponse = await fetch(
          `https://api.netlify.com/api/v1/deploys/${deployId}/files${file}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
              "Content-Type": "application/octet-stream",
            },
            body: files[file], // Send raw file content
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
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Deploy to Netlify
        </button>
      </div>
    </div>
  );
};

export default Editor;
