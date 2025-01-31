"use client";

import { useState } from "react";
import sha1 from "sha1";
import { Alert, Button, Label, TextInput, Card } from "flowbite-react";
import { Link } from "react-router-dom";

const Deploy = () => {
  const [netlifyToken, setNetlifyToken] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteInfo, setSiteInfo] = useState(null);
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
      setSiteInfo(siteData);
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

      // Update the state with deployment info
      setDeploymentInfo({
        name: siteData.name,
        url: siteData.ssl_url,
        adminUrl: siteData.admin_url,
        deployUrl: deployData.deploy_ssl_url,
      });

      alert("Deployment successful!");
    } catch (error) {
      console.error("Error deploying to Netlify:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Deploy to Netlify</h1>

      <Alert color="info" className="mb-4 bg-cyan-300 text-cyan-700 rounded-md">
        <h3 className="text-lg font-medium mb-2">
          How to get your Netlify Access Token:
        </h3>
        <ol className="list-decimal list-inside">
          <li>Log in to your Netlify account</li>
          <li>Go to User Settings (click your avatar in the top right)</li>
          <li>Navigate to the "Applications" section</li>
          <li>Under "Personal access tokens", click "New access token"</li>
          <li>Give your token a description and click "Generate token"</li>
          <li>Copy the generated token (you won't be able to see it again!)</li>
        </ol>
      </Alert>

      <Alert
        color="warning"
        className="mb-4 bg-lime-200 text-lime-700 rounded-md"
      >
        <h3 className="text-lg font-medium mb-2">Important Note:</h3>
        <p>
          The site name must be unique across all Netlify sites. Choose a name
          that is unlikely to be taken, such as including your username or a
          unique identifier.
        </p>
      </Alert>

      <div className="mb-4">
        <div className="mb-2">
          <Label htmlFor="netlifyToken" value="Netlify Token" />
        </div>
        <TextInput
          id="netlifyToken"
          type="text"
          placeholder="Enter your Netlify token"
          value={netlifyToken}
          onChange={(e) => setNetlifyToken(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <div className="mb-2">
          <Label htmlFor="siteName" value="Site Name (must be unique)" />
        </div>
        <TextInput
          id="siteName"
          type="text"
          placeholder="Enter a unique site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
      </div>

      <Button
        onClick={deployToNetlify}
        className="w-full text-lg bg-gray-600 hover:bg-gray-700"
      >
        Deploy to Netlify
      </Button>

      {siteInfo && (
        <Card className="mt-6">
          <div className="space-y-2 p-4">
            <h2 className="text-2xl font-semibold mb-4">
              Deployment Successful!
            </h2>
            <p>
              <strong>Site Name:</strong> {siteInfo.name}
            </p>
            <p>
              <strong>Site URL:</strong>{" "}
              <a
                href={siteInfo.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {siteInfo.deployUrl}
              </a>
            </p>
            <p>
              <strong>Deploy URL:</strong>{" "}
              <a
                href={siteInfo.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {siteInfo.deployUrl}
              </a>
            </p>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Deployment Guide:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Obtain your Netlify Access Token as described above.</li>
          <li>
            Choose a unique site name. This will be part of your deployed URL
            (e.g., your-site-name.netlify.app).
          </li>
          <li>
            Enter your Netlify Access Token and chosen site name in the fields
            above.
          </li>
          <li>Click the "Deploy to Netlify" button.</li>
          <li>
            Wait for the deployment process to complete. You'll see the
            deployment information once it's done.
          </li>
          <li>
            Once deployment is successful, you can access your site using the
            provided URLs.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Deploy;
