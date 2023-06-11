import { Model, ModelSettings } from "../Model.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { TokenizationSupport } from "../tokenization/TokenizationSupport.js";

export interface TextGenerationModelSettings extends ModelSettings {
  trimOutput?: boolean;
}

export interface TextGenerationModel<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings
> extends Model<SETTINGS> {
  /**
   * Generates a text using a prompt.
   * The prompt format depends on the model.
   * For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
   */
  generateText(
    prompt: PROMPT,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): PromiseLike<string>;
  /**
   * Generates a text using a prompt.
   * The prompt format depends on the model.
   * For example, OpenAI text models expect a string prompt, and OpenAI chat models expect an array of chat messages.
   */
  generateText(
    prompt: PROMPT,
    settings:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null, // require explicit null when run is set
    run: RunContext
  ): PromiseLike<string>;

  /**
   * Uses a prompt template to create a function that generates text.
   * The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
   * The input signature of the prompt templates becomes the call signature of the generated function.
   */
  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ): (input: INPUT, run?: RunContext) => PromiseLike<string>;
}

export interface TextGenerationModelWithTokenization<
  PROMPT,
  SETTINGS extends TextGenerationModelSettings
> extends TextGenerationModel<PROMPT, SETTINGS>,
    TokenizationSupport {
  countPromptTokens(prompt: PROMPT): PromiseLike<number>;
  withMaxTokens(
    maxTokens: number
  ): TextGenerationModelWithTokenization<PROMPT, SETTINGS>;
}
