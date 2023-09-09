import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";
import { loadApiKey } from "../../core/api/loadApiKey.js";

export class ElevenLabsApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "https://api.elevenlabs.io/v1",
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
        "xi-api-key": loadApiKey({
          apiKey,
          environmentVariableName: "ELEVENLABS_API_KEY",
          description: "ElevenLabs",
        }),
      },
      retry,
      throttle,
    });
  }
}
