export type TextEmbeddingModel<RAW_OUTPUT> = {
  readonly provider: string;
  readonly model: string | null;

  /**
   * The limit of texts that can be processed in a single API call.
   */
  readonly maxTextsPerCall: number;

  /**
   * The limit of tokens for a single text.
   */
  readonly maxTextTokens: number;

  /**
   * The size of the embedding vector.
   */
  readonly embeddingDimensions: number;

  embed: (
    texts: Array<string>,
    context?: {
      abortSignal?: AbortSignal | undefined;
      userId?: string | undefined;
    }
  ) => PromiseLike<RAW_OUTPUT>;

  extractEmbeddings: (output: RAW_OUTPUT) => PromiseLike<Array<Array<number>>>;
};
