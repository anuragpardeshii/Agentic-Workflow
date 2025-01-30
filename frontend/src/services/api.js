import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/groq/generate`, { prompt });
    console.log("id", response.data.response._id);
    console.log("response", response.data.response.content);
    console.log("prompt", response.data.response.prompt);
    return response.data.content;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to generate response"
    );
  }
};
