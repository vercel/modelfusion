import { BasicApiConfiguration } from "../../model-function/BasicApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class LmntApiConfiguration extends BasicApiConfiguration {
  readonly apiKey: string;

  constructor({
    baseUrl = "https://api.lmnt.com/speech/beta",
    apiKey,
    retry,
    throttle,
  }: {
    baseUrl?: string;
    apiKey?: string;
    retry?: RetryFunction;
    throttle?: ThrottleFunction;
  } = {}) {
    super({
      baseUrl,
      retry,
      throttle,
    });

    this.apiKey = loadApiKey({
      apiKey,
      environmentVariableName: "LMNT_API_KEY",
      description: "LMNT",
    });
  }

  get headers(): Record<string, string> {
    return { "X-API-Key": this.apiKey };
  }
}
