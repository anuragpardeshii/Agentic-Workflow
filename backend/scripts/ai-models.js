// Public catalogue only: no credentials, inference requests or quota consumption.
try {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`Catalogue returned HTTP ${response.status}`);
  const { data } = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid catalogue response");
  const models = data
    .filter(
      (model) =>
        (model.id?.endsWith(":free") || model.id === "openrouter/free") &&
        model.pricing?.prompt === "0" &&
        model.pricing?.completion === "0" &&
        (model.pricing?.request === undefined ||
          model.pricing.request === "0") &&
        model.supported_parameters?.includes("response_format") &&
        model.supported_parameters?.includes("max_tokens"),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  console.log("Currently listed free models supporting JSON and max_tokens:");
  for (const model of models)
    console.log(`${model.id}\tcontext: ${model.context_length}`);
  console.log(
    "Check model pages for promotion end dates. Availability and account quotas still apply.",
  );
} catch (error) {
  console.error(`Unable to list free models: ${error.message}`);
  process.exitCode = 1;
}
