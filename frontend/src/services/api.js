import axios from "axios";

const API_URL = "/api";

export const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/groq/generate`, { prompt });
    return response.data.response;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to generate response"
    );
  }
};
