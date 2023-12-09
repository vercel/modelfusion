import { BaseUrlApiConfiguration } from "../../core/api/BaseUrlApiConfiguration.js";
import { RetryFunction } from "../../core/api/RetryFunction.js";
import { ThrottleFunction } from "../../core/api/ThrottleFunction.js";

export type WhisperCppApiConfigurationSettings = {
  baseUrl?: string;
  retry?: RetryFunction;
  throttle?: ThrottleFunction;
};

export class WhisperCppApiConfiguration extends BaseUrlApiConfiguration {
  constructor({
    baseUrl = "http://127.0.0.1:8080",
    retry,
    throttle,
  }: WhisperCppApiConfigurationSettings = {}) {
    super({
      baseUrl,
      headers: {},
      retry,
      throttle,
    });
  }
}
