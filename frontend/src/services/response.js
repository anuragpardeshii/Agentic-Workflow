import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const getResponseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/responses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching response:", error);
    throw error;
  }
};

export const updateProject = async (prompt, previousContent) => {
  try {
    const response = await axios.post(`${API_URL}/groq/update`, {
      prompt,
      previousContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};