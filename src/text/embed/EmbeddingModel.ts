export type EmbeddingModel<RAW_OUTPUT, GENERATED_OUTPUT> = {
  vendor: string;
  model: string;
  embed: (
    input: string,
    context?: {
      abortSignal?: AbortSignal | undefined;
      userId?: string | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;
  extractEmbedding: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
};
