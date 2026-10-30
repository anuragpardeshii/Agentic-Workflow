import { api } from "./api";
export const getResponseById = (id) => api(`/responses/${id}`);
export const updateProject = (data) =>
  api("/projects/update", { method: "POST", body: JSON.stringify(data) });
