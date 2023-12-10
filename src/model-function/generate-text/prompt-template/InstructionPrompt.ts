import { MultiModalInput } from "./Content.js";

/**
 * A single multi-modal instruction prompt. It can contain an optional system message to define
 * the role and behavior of the language model.
 * The instruction is a multi-model input (`array` of content).
 */
export interface MultiModalInstructionPrompt {
  /**
   * Optional system message to provide context for the language model. Note that for some models,
   * changing the system message can impact the results, because the model may be trained on the default system message.
   */
  system?: string;

  /**
   * The multi-modal instruction for the model.
   */
  instruction: MultiModalInput;
}

/**
 * A single text instruction prompt. It can contain an optional system message to define
 * the role and behavior of the language model.
 *
 * @example
 * ```ts
 * {
 *   system: "You are a celebrated poet.", // optional
 *   instruction: "Write a story about a robot learning to love",
 * }
 * ```
 */
export interface TextInstructionPrompt {
  /**
   * Optional system message to provide context for the language model. Note that for some models,
   * changing the system message can impact the results, because the model may be trained on the default system message.
   */
  system?: string;

  /**
   * The text instruction for the model.
   */
  instruction: string;

  /**
   * Response prefix that will be injected in the prompt at the beginning of the response.
   * This is useful for guiding the model by starting its response with a specific text.
   *
   * Note: Not all models support this feature. E.g. it is not supported by OpenAI chat models.
   */
  responsePrefix?: string;
}
