export type EmbeddingModel<RAW_OUTPUT, EMBEDDING> = {
  readonly provider: string;
  readonly model: string;

  readonly maxTextsPerCall: number;

  embed: (
    texts: Array<string>,
    context?: {
      abortSignal?: AbortSignal | undefined;
      userId?: string | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;

  extractEmbedding: (output: RAW_OUTPUT) => PromiseLike<Array<EMBEDDING>>;
};
