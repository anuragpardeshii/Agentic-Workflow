import { systemPrompt } from "../../data/systemPrompt.js";
import { parseProject } from "./project.js";
import { complete } from "./providers.js";

export async function generateProject(prompt, previousContent, options) {
  // Accept older project shapes as context, but require complete new output.
  const previous = previousContent
    ? parseProject(previousContent, { complete: false, status: 400 })
    : null;
  const messages = [
    { role: "system", content: systemPrompt },
    ...(previous
      ? [{ role: "assistant", content: JSON.stringify(previous) }]
      : []),
    { role: "user", content: prompt },
  ];
  return JSON.stringify(parseProject(await complete(messages, options)));
}
