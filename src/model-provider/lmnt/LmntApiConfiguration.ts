import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class LmntApiConfiguration extends BaseUrlApiConfiguration {
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
      headers: {
        "X-API-Key": loadApiKey({
          apiKey,
          environmentVariableName: "LMNT_API_KEY",
          description: "LMNT",
        }),
      },
      retry,
      throttle,
    });
  }
}
