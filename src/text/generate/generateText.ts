import { Prompt } from "../../run/Prompt.js";
import { RunContext } from "../../run/RunContext.js";
import { RetryFunction } from "../../util/retry/RetryFunction.js";
import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "./GenerateTextEvent.js";
import { TextGenerationModel } from "./TextGenerationModel.js";
import { generateValueFromText } from "./generateValueFromText.js";

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

/**
 * @example
 * const generateStory = generateText.asFunction({
 *   model,
 *   prompt: async ({ character }: { character: string }) =>
 *     `Write a short story about ${character} learning to love:\n\n`,
 * });
 *
 * const text = await generateStory({ character: "a robot" });
 */
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
