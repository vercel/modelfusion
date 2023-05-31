export type TextEmbeddingModel<RAW_OUTPUT, EMBEDDING> = {
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

  extractEmbeddings: (output: RAW_OUTPUT) => PromiseLike<Array<EMBEDDING>>;
};
