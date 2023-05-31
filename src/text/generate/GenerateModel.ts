export type GenerateModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT> = {
  readonly provider: string;
  readonly model: string;

  generate: (
    prompt: PROMPT_TYPE,
    context?: {
      abortSignal?: AbortSignal | undefined;
      userId?: string | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;

  extractOutput: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
};
