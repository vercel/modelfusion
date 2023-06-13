import { Model, ModelSettings } from "../Model.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";

export interface ImageGenerationModelSettings extends ModelSettings {}

export interface ImageGenerationModel<
  PROMPT,
  SETTINGS extends ImageGenerationModelSettings
> extends Model<SETTINGS> {
  /**
   * Generates a base64-encoded image using a prompt.
   * The prompt format depends on the model.
   * For example, OpenAI image models expect a string prompt, and Stability AI models expect an array of text prompts with optional weights.
   *
   * @example
   * const model = new StabilityImageGenerationModel(...);
   *
   * const imageBase64 = await model.generateImage([
   *   { text: "the wicked witch of the west" },
   *   { text: "style of early 19th century painting", weight: 0.5 },
   * ]);
   */
  generateImage(
    prompt: PROMPT,
    options?: {
      functionId?: string;
      settings?: Partial<SETTINGS>;
      run?: RunContext;
    }
  ): PromiseLike<string>;

  /**
   * Uses a prompt template to create a function that generates an image.
   * The prompt template is a function that takes an input and returns a prompt that matches the model's prompt format.
   * The input signature of the prompt templates becomes the call signature of the generated function.
   *
   * @example
   * const model = new StabilityImageGenerationModel(...);
   *
   * const generatePainting = model.generateImageAsFunction(
   *   async (description: string) => [
   *     { text: description },
   *     { text: "style of early 19th century painting", weight: 0.5 },
   *   ]
   * );
   *
   * const imageBase64 = await generatePainting("the wicked witch of the west");
   */
  generateImageAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    options?: {
      functionId?: string;
      settings?: Partial<SETTINGS>;
    }
  ): (
    input: INPUT,
    options?: {
      functionId?: string;
      settings?: Partial<SETTINGS>;
      run?: RunContext;
    }
  ) => PromiseLike<string>;
}
