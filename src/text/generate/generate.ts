import { Prompt } from "../../prompt/Prompt.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { RetryFunction } from "../../util/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../util/retryWithExponentialBackoff.js";
import { GeneratorModel } from "./GeneratorModel.js";

export async function generate<
  INPUT,
  PROMPT_TYPE,
  RAW_OUTPUT,
  GENERATED_OUTPUT,
  OUTPUT
>(
  {
    id,
    prompt,
    input,
    model,
    processOutput,
    retry = retryWithExponentialBackoff(),
  }: {
    id?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT>;
    processOutput: (output: GENERATED_OUTPUT) => PromiseLike<OUTPUT>;
    retry?: RetryFunction;
  },
  context?: RunContext
): Promise<OUTPUT> {
  const expandedPrompt = await prompt(input);

  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  context?.recordCallStart?.({
    type: "generate-start",
    metadata: {
      id,
      model: {
        vendor: model.vendor,
        name: model.name,
      },
      startEpochSeconds,
    },
    input: expandedPrompt,
  });

  const rawOutput = await retry(() => model.generate(expandedPrompt));

  const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    id,
    model: {
      vendor: model.vendor,
      name: model.name,
    },
    startEpochSeconds,
    durationInMs: textGenerationDurationInMs,
    tries: rawOutput.tries,
  };

  if (rawOutput.status === "failure") {
    context?.recordCallEnd?.({
      type: "generate-end",
      status: "failure",
      metadata,
      input: expandedPrompt,
      error: rawOutput.error,
    });

    throw rawOutput.error;
  }

  if (rawOutput.status === "abort") {
    context?.recordCallEnd?.({
      type: "generate-end",
      status: "abort",
      metadata,
      input: expandedPrompt,
    });

    throw new AbortError();
  }

  const extractedOutput = await model.extractOutput(rawOutput.result);

  context?.recordCallEnd?.({
    type: "generate-end",
    status: "success",
    metadata,
    input: expandedPrompt,
    rawOutput: rawOutput.result,
    extractedOutput,
  });

  return processOutput(extractedOutput);
}

generate.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT, OUTPUT>({
    id,
    prompt,
    model,
    processOutput,
    retry,
  }: {
    id?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: GeneratorModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT>;
    processOutput: (output: GENERATED_OUTPUT) => PromiseLike<OUTPUT>;
    retry?: RetryFunction;
  }) =>
  async (input: INPUT, context: RunContext) =>
    generate(
      {
        id,
        prompt,
        input,
        model,
        processOutput,
        retry,
      },
      context
    );
