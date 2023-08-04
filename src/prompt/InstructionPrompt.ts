/**
 * A single instruction prompt. It can contain an optional system message to provide context for the language model.
 */
export type InstructionPrompt = {
  /**
   * Optional system message to provide context for the language model.
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
