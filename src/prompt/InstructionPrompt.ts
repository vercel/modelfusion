/**
 * A single instruction prompt. It can contain an optional system message to define the role and behavior of the language model
 * and an optiona input to provide context for the language model.
 *
 * @example
 * ```ts
 * {
 *   system: "You are a celebrated poet.", // optional
 *   instruction: "Write a short story about:",
 *   input: "a robot learning to love.", // optional
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
   * Optional additional input or context, e.g. a the content from which information should be extracted.
   */
  input?: string;
};
