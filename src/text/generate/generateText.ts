import { Prompt } from "../../prompt/Prompt.js";
import {
  GenerateCallEndEvent,
  GenerateCallStartEvent,
} from "../../run/GenerateCallEvent.js";
import { RunContext } from "../../run/RunContext.js";
import { RetryFunction } from "../../util/RetryFunction.js";
import { GeneratorModel } from "./GeneratorModel.js";
import { generate } from "./generate.js";

export function generateText<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  {
    functionId,
    input,
    prompt,
    model,
    processOutput = async (output) => output.trim(),
    retry,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  },
  context?: RunContext
) {
  return generate(
    {
      functionId,
      input,
      prompt,
      model,
      processOutput,
      retry,
      onCallStart,
      onCallEnd,
    },
    context
  );
}

generateText.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>({
    functionId,
    prompt,
    model,
    processOutput,
    retry,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, string>;
    processOutput?: (output: string) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }) =>
  async (input: INPUT, context?: RunContext) =>
    generateText(
      {
        functionId,
        input,
        prompt,
        model,
        processOutput,
        retry,
        onCallStart,
        onCallEnd,
      },
      context
    );
