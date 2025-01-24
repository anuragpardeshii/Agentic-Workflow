import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/groq/generate`, { prompt });
    return response.data.content;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to generate response"
    );
  }
};
