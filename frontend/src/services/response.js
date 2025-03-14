import axios from "axios";

const API_URL = "https://agentic-backend-psi.vercel.app/api";

export const getResponseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/responses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching response:", error);
    throw error;
  }
};

export const updateProject = async ({ prompt, previousContent }) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  try {
    const response = await axios.post(`${API_URL}/groq/update`, {
      prompt,
      previousContent: previousContent || "",
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};
