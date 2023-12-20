import { LoadAPIKeyError } from "./LoadAPIKeyError.js";

export function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description,
}: {
  apiKey: string | undefined;
  environmentVariableName: string;
  apiKeyParameterName?: string;
  description: string;
}): string {
  if (apiKey != null) {
    return apiKey;
  }

  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter into the API configuration. Environment variables is not supported in this environment.`,
    });
  }

  apiKey = process.env[environmentVariableName];

  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter into the API configuration or set it as an environment variable named ${environmentVariableName}.`,
    });
  }

  return apiKey;
}
