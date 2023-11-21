/**
 * A single instruction prompt. It can contain an optional system message to define the role and behavior of the language model.
 *
 * @example
 * ```ts
 * {
 *   system: "You are a celebrated poet.", // optional
 *   instruction: "Write a story about a robot learning to love",
 * }
 * ```
 */
export type InstructionPrompt = {
  /**
   * Optional system message to provide context for the language model. Note that for some models,
   * changing the system message can impact the results, because the model may be trained on the default system message.
   */
  system?: string;

  /**
   * The instruction for the model.
   */
  instruction: string;

  /**
   * Optional image to provide context for the language model. Only supported by some models.
   */
  image?: {
    /**
     * Base-64 encoded image.
     */
    base64Content: string;

    /**
     * Optional mime type of the image.
     */
    mimeType?: string;
  };
};
