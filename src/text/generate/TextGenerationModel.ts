import { TokenizationSupport } from "text/index.js";

export type TextGenerationModel<PROMPT, RAW_OUTPUT, GENERATED_OUTPUT> = {
  readonly provider: string;
  readonly model: string | null;

  generate: (
    prompt: PROMPT,
    context?: {
      abortSignal?: AbortSignal | undefined;
      userId?: string | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;

  extractOutput: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
};

export type TextGenerationModelWithTokenization<
  PROMPT,
  RAW_OUTPUT,
  GENERATED_OUTPUT
> = TextGenerationModel<PROMPT, RAW_OUTPUT, GENERATED_OUTPUT> &
  TokenizationSupport & {
    countPromptTokens: (prompt: PROMPT) => PromiseLike<number>;
    withMaxTokens: (
      maxTokens: number
    ) => TextGenerationModelWithTokenization<
      PROMPT,
      RAW_OUTPUT,
      GENERATED_OUTPUT
    >;
  };
