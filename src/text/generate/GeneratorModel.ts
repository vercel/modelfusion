export type GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT> = {
  vendor: string;
  model: string;

  generate: (
    value: PROMPT_TYPE,
    {
      abortSignal,
    }: {
      abortSignal?: AbortSignal | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;

  extractOutput: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
};
