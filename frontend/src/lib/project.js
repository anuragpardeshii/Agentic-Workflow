export function parseProject(content) {
  const project = JSON.parse(
    content.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || content,
  );
  if (
    !project?.files ||
    !Object.keys(project.files).length ||
    Object.values(project.files).some((file) => typeof file?.code !== "string")
  )
    throw new Error("The generated project is invalid. Please try again.");
  return project;
}
export function readProject() {
  try {
    return JSON.parse(sessionStorage.getItem("project")) || null;
  } catch {
    return null;
  }
}
export function saveProject(project) {
  sessionStorage.setItem("project", JSON.stringify(project));
}
