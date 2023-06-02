import { RunContext } from "run/RunContext.js";

export type ImageGenerationModel<PROMPT_TYPE, RAW_OUTPUT> = {
  readonly provider: string;
  readonly model: string | null;

  generate: (
    prompt: PROMPT_TYPE,
    context?: RunContext
  ) => PromiseLike<RAW_OUTPUT>;

  extractImageBase64: (output: RAW_OUTPUT) => PromiseLike<string>;
};
