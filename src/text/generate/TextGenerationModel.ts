import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { TokenizationSupport } from "../tokenize/TokenizationSupport.js";

export interface TextGenerationModel<PROMPT> {
  /**
   * `generateText` generates text from a model using a prompt.
   * You can either call it directly or use `.asFunction` to create a function that uses the arguments
   * of a prompt template.
   *
   * @param model The model to use for text generation.
   * @param prompt The prompt to use for text generation.
   * It is a function that returns a prompt object in the format that is expected by the model.
   * Its arguments define the inputs (of either the `inputs` parameter or the returned function).
   * @param processText A function that processes the output of the model.
   * It is called with the extracted text from the model.
   * It returns the processed output.
   * The default function trims the whitespace around the output.
   *
   * @example
   * const generateStory = generateText.asFunction({
   *   model,
   *   prompt: async ({ character }: { character: string }) =>
   *     `Write a short story about ${character} learning to love:\n\n`,
   * });
   *
   * const text = await generateStory({ character: "a robot" });
   */
  generateText: (prompt: PROMPT, context?: RunContext) => PromiseLike<string>;

  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, string>
  ): (input: INPUT, context?: RunContext) => PromiseLike<string>;
}

export interface TextGenerationModelWithTokenization<PROMPT>
  extends TextGenerationModel<PROMPT>,
    TokenizationSupport {
  countPromptTokens: (prompt: PROMPT) => PromiseLike<number>;
  withMaxTokens: (
    maxTokens: number
  ) => TextGenerationModelWithTokenization<PROMPT>;
}
