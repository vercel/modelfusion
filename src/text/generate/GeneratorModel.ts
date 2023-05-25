export type GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT> = {
  vendor: string;
  name: string;
  generate: (value: PROMPT_TYPE) => PromiseLike<RAW_OUTPUT>;
  extractOutput: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
};
