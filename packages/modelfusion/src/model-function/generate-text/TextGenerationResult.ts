export type TextGenerationResult = {
  /**
   * The generated text.
   */
  text: string;

  /**
   * The reason why the generation stopped.
   */
  finishReason: TextGenerationFinishReason;
};

export type TextGenerationFinishReason =
  | "stop"
  | "length"
  | "content-filter"
  | "tool-calls"
  | "error"
  | "other"
  | "unknown";
