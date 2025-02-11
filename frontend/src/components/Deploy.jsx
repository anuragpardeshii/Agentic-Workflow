import React, { useState } from "react";

const Deploy = () => {
  const [loading, setLoading] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [error, setError] = useState(null);
  const [vercelToken, setVercelToken] = useState("");

  const deployToVercel = async () => {
    try {
      setLoading(true);
      setDeploymentUrl(null);
      setError(null);

      if (!vercelToken.trim()) {
        throw new Error("Please enter your Vercel access token.");
      }

      // Retrieve project data from localStorage
      const jsonData = JSON.parse(localStorage.getItem("jsonData"));

      if (!jsonData || !jsonData.files) {
        throw new Error("No project data found in localStorage.");
      }

      const projectTitle = jsonData.projectTitle || "default-project";
      const files = jsonData.files;

      const filesArray = Object.entries(files).map(([filePath, fileObj]) => ({
        file: filePath.replace(/^\//, ""),
        data:
          typeof fileObj.code === "string"
            ? fileObj.code
            : JSON.stringify(fileObj.code),
      }));

      if (!filesArray.length) {
        throw new Error("No files available to deploy.");
      }

      const payload = {
        files: filesArray,
        name: projectTitle.toLowerCase().replace(/\s+/g, "-"),
        projectSettings: { framework: "create-react-app" },
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      const response = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deployment failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      setDeploymentUrl(responseData.url);
      console.log("✅ Deployment successful:", responseData);
    } catch (error) {
      console.error("❌ Deployment error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Deploy to Vercel 🚀
        </h2>

        {/* Instruction Card */}
        <div className="bg-blue-100 p-4 rounded-lg text-gray-700 mb-4">
          <h3 className="text-lg font-semibold">
            How to Get a Vercel Access Token:
          </h3>
          <ol className="list-decimal list-inside text-sm mt-2">
            <li>
              Go to{" "}
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Vercel Tokens
              </a>
              .
            </li>
            <li>Click "Create Token" and give it a name.</li>
            <li>Copy the generated token and paste it below.</li>
          </ol>
        </div>

        {/* Vercel Token Input */}
        <input
          type="text"
          placeholder="Enter your Vercel Access Token"
          value={vercelToken}
          onChange={(e) => setVercelToken(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />

        {/* Deploy Button */}
        <button
          onClick={deployToVercel}
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Deploying..." : "Deploy Now"}
        </button>

        {/* Deployment URL */}
        {deploymentUrl && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 text-center rounded-lg">
            ✅ Deployment Successful!{" "}
            <a
              href={`https://${deploymentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {deploymentUrl}
            </a>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center mt-4">
            ❌ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Deploy;
