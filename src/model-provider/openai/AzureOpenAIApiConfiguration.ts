import { BasicApiConfiguration } from "../../model-function/BasicApiConfiguration.js";
import { RetryFunction } from "../../util/api/RetryFunction.js";
import { ThrottleFunction } from "../../util/api/ThrottleFunction.js";
import { loadApiKey } from "../../util/api/loadApiKey.js";

/**
 * Cconfiguration for the Azure OpenAI API. This class is responsible for constructing URLs specific to the Azure OpenAI deployment.
 * It creates URLs of the form
 * `[baseUrl]/[path]?api-version=[apiVersion]`
 *
 * The `baseUrl` should have a format similar to: `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentId}`
 * (no trailing slash).
 *
 * @see https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
 */
export class AzureOpenAIApiConfiguration extends BasicApiConfiguration {
  readonly apiVersion: string;

  readonly apiKey: string;

  constructor({
    baseUrl,
    apiVersion,
    apiKey,
    retry,
    throttle,
  }: {
    baseUrl: string;
    apiVersion: string;
    apiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  }) {
    super({
      baseUrl,
      retry,
      throttle,
    });

    this.apiVersion = apiVersion;

    this.apiKey = loadApiKey({
      apiKey,
      environmentVariableName: "AZURE_OPENAI_API_KEY",
      description: "Azure OpenAI",
    });
  }

  assembleUrl(path: string): string {
    return `${this.baseUrl}${path}?api-version=${this.apiVersion}`;
  }

  get headers(): Record<string, string> {
    return {
      "api-key": this.apiKey,
    };
  }
}
