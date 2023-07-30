/**
 * A single instruction prompt. It can contain an optional system message to provide context for the language model.
 */
export type InstructionPrompt = {
  system?: string;
  instruction: string;
};
