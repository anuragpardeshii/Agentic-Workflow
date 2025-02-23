import React, { useState } from "react";
import { Bot, Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Theme from "../components/Theme";

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
        data: typeof fileObj.code === "string" ? fileObj.code : JSON.stringify(fileObj.code),
      }));

      if (!filesArray.length) {
        throw new Error("No files available to deploy.");
      }

      const payload = {
        files: filesArray,
        name: projectTitle.toLowerCase().replace(/\s+/g, "-"),
        projectSettings: { framework: "create-react-app" },
      };

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
    } catch (error) {
      console.error("❌ Deployment error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0118] overflow-hidden">
      <div className="p-4 border-b border-purple-500/20">
            <Link to="/ai" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Bot className="w-8 h-8 text-purple-400" />
              </motion.div>
              <span className="text-xl font-bold text-white">BuildFast.new</span>
            </Link>
        </div>
    
      <Theme/>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] p-4">
        <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 w-full max-w-lg">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Rocket className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">
              Deploy to Vercel
            </h2>
          </div>

          {/* Instructions */}
          <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg text-purple-200 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              How to Get a Vercel Access Token:
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to{" "}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Vercel Tokens
                </a>
              </li>
              <li>Click "Create Token" and give it a name</li>
              <li>Copy the generated token and paste it below</li>
            </ol>
          </div>

          {/* Token Input */}
          <input
            type="text"
            placeholder="Enter your Vercel Access Token"
            value={vercelToken}
            onChange={(e) => setVercelToken(e.target.value)}
            className="w-full p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 mb-4"
          />

          {/* Deploy Button */}
          <button
            onClick={deployToVercel}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium px-6 py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Deploy Now</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Success Message */}
          {deploymentUrl && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 text-green-300 text-center rounded-lg">
              ✨ Deployment Successful!{" "}
              <a
                href={`https://${deploymentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {deploymentUrl}
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-center rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default Deploy;