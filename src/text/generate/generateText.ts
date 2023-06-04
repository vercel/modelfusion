import { Prompt } from "../../run/Prompt.js";
import { RunContext } from "../../run/RunContext.js";
import { RetryFunction } from "../../util/retry/RetryFunction.js";
import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "./GenerateTextEvent.js";
import { TextGenerationModel } from "./TextGenerationModel.js";
import { generateValueFromText } from "./generateValueFromText.js";

/**
 * `generateText` allows you to easily generate text from a model using a prompt.
 * You can either call it directly or use `.asFunction` to create a function that uses the arguments
 * of the prompt.
 *
 * @param model The model to use for text generation.
 * @param prompt The prompt to use for text generation.
 * It is a function that returns a prompt object in the format that is expected by the model.
 * Its arguments define the inputs (of either the `inputs` parameter or the returned function).
 * @param processOutput A function that processes the output of the model.
 * It is called with the output of the model and the prompt object.
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
export async function generateText<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  {
    functionId,
    input,
    prompt,
    model,
    processOutput = async (output) => output.trim(),
    onStart,
    onEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    processOutput?: (output: string) => PromiseLike<string>;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  },
  context?: RunContext
): Promise<string> {
  return generateValueFromText(
    {
      functionId,
      input,
      prompt,
      model,
      processOutput,
      onStart,
      onEnd,
    },
    context
  );
}

generateText.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  }) =>
  async (input: INPUT, context?: RunContext) =>
    generateText({ input, ...options }, context);
