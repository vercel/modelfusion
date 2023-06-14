import { PromptTemplate } from "../../run/PromptTemplate.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { Model, ModelSettings } from "../Model.js";
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
   *
   * @example
   * const model = new OpenAITextGenerationModel(...);
   *
   * const text = await model.generateText(
   *   "Write a short story about a robot learning to love:\n\n"
   * );
   */
  generateText(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): PromiseLike<string>;

  /**
   * Uses a prompt template to create a function that generates text.
   * The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
   * The input signature of the prompt templates becomes the call signature of the generated function.
   *
   * @example
   * const model = new OpenAITextGenerationModel(...);
   *
   * const generateStoryAbout = model.generateTextAsFunction(
   *   async (character: string) =>
   *     `Write a short story about ${character} learning to love:\n\n`
   * );
   *
   * const story = await generateStoryAbout("a robot");
   */
  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    options?: Omit<FunctionOptions<SETTINGS>, "run">
  ): (input: INPUT, options?: FunctionOptions<SETTINGS>) => PromiseLike<string>;
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
