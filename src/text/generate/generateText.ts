import { Prompt } from "../../prompt/Prompt.js";
import {
  GenerateCallEndEvent,
  GenerateCallStartEvent,
} from "../../run/GenerateCallEvent.js";
import { RunContext } from "../../run/RunContext.js";
import { RunFunction } from "../../run/RunFunction.js";
import { AbortError } from "../../util/AbortError.js";
import { RetryFunction } from "../../util/RetryFunction.js";
import { GeneratorModel } from "./GeneratorModel.js";
import { generate } from "./generate.js";

export async function generateText<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  input: Parameters<typeof safeGenerateText<INPUT, PROMPT_TYPE, RAW_OUTPUT>>[0],
  context?: RunContext
): Promise<string> {
  const result = await safeGenerateText(input, context);

  if (!result.ok) {
    if (result.isAborted) {
      throw new AbortError("The generation was aborted.");
    }

    throw result.error;
  }

  return result.result;
}

generateText.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }): RunFunction<INPUT, string> =>
  async (input: INPUT, context?: RunContext) =>
    generateText({ input, ...options }, context);

generateText.safe = safeGenerateText;

generateText.asSafeFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }) =>
  async (input: INPUT, context?: RunContext) =>
    safeGenerateText({ input, ...options }, context);

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
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }) =>
  async (input: INPUT, context?: RunContext) =>
    generateText({ input, ...options }, context);

function safeGenerateText<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  {
    functionId,
    input,
    prompt,
    model,
    extractOutput,
    processOutput = async (output) => output.trim(),
    retry,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  },
  context?: RunContext
) {
  return generate.safe(
    {
      functionId,
      input,
      prompt,
      model,
      extractOutput,
      processOutput,
      retry,
      onCallStart,
      onCallEnd,
    },
    context
  );
}
