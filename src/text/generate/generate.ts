import { createId } from "@paralleldrive/cuid2";
import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "text/generate/GenerateTextEvent.js";
import { Prompt } from "../../run/Prompt.js";
import { RunContext } from "../../run/RunContext.js";
import { RunFunction, SafeRunFunction } from "../../run/RunFunction.js";
import { AbortError } from "../../util/AbortError.js";
import { SafeResult } from "../../util/SafeResult.js";
import { RetryFunction } from "../../util/retry/RetryFunction.js";
import { runSafe } from "../../util/runSafe.js";
import { TextGenerationModel } from "./TextGenerationModel.js";
import { GenerateTextObserver } from "./GenerateTextObserver.js";

export async function generate<
  INPUT,
  PROMPT_TYPE,
  RAW_OUTPUT,
  GENERATED_OUTPUT,
  OUTPUT
>(
  input: Parameters<
    typeof safeGenerate<
      INPUT,
      PROMPT_TYPE,
      RAW_OUTPUT,
      GENERATED_OUTPUT,
      OUTPUT
    >
  >[0],
  context?: RunContext & GenerateTextObserver
): Promise<OUTPUT> {
  const result = await safeGenerate(input, context);

  if (!result.ok) {
    if (result.isAborted) {
      throw new AbortError("The generation was aborted.");
    }

    throw result.error;
  }

  return result.output;
}

generate.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT, OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
    processOutput: (output: GENERATED_OUTPUT) => PromiseLike<OUTPUT>;
    retry?: RetryFunction;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  }): RunFunction<INPUT, OUTPUT> =>
  async (input: INPUT, context?: RunContext & GenerateTextObserver) =>
    generate({ input, ...options }, context);

generate.safe = safeGenerate;

generate.asSafeFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT, OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
    processOutput: (output: GENERATED_OUTPUT) => PromiseLike<OUTPUT>;
    retry?: RetryFunction;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  }): SafeRunFunction<INPUT, OUTPUT> =>
  async (input: INPUT, context?: RunContext & GenerateTextObserver) =>
    safeGenerate({ input, ...options }, context);

async function safeGenerate<
  INPUT,
  PROMPT_TYPE,
  RAW_OUTPUT,
  GENERATED_OUTPUT,
  OUTPUT
>(
  {
    functionId,
    prompt,
    input,
    model,
    processOutput,
    extractOutput = model.extractOutput,
    onStart,
    onEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT, GENERATED_OUTPUT>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<GENERATED_OUTPUT>;
    processOutput: (output: GENERATED_OUTPUT) => PromiseLike<OUTPUT>;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  },
  context?: RunContext & GenerateTextObserver
): Promise<SafeResult<OUTPUT>> {
  const expandedPrompt = await prompt(input);

  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = createId();

  const startMetadata = {
    callId,
    functionId,
    runId: context?.runId,
    sessionId: context?.sessionId,
    userId: context?.userId,

    model: {
      provider: model.provider,
      name: model.model,
    },
    startEpochSeconds,
  };

  const startEvent: GenerateTextStartEvent = {
    type: "generate-text-start",
    metadata: startMetadata,
    input: expandedPrompt,
  };

  onStart?.(startEvent);
  context?.onGenerateTextStart?.(startEvent);

  const result = await runSafe(() =>
    model.generate(expandedPrompt, {
      abortSignal: context?.abortSignal,
    })
  );

  const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: textGenerationDurationInMs,
    ...startMetadata,
  };

  if (!result.ok) {
    if (result.isAborted) {
      const endEvent: GenerateTextEndEvent = {
        type: "generate-text-end",
        status: "abort",
        metadata,
        input: expandedPrompt,
      };

      onEnd?.(endEvent);
      context?.onGenerateTextEnd?.(endEvent);

      return { ok: false, isAborted: true };
    }

    const endEvent: GenerateTextEndEvent = {
      type: "generate-text-end",
      status: "failure",
      metadata,
      input: expandedPrompt,
      error: result.error,
    };

    onEnd?.(endEvent);
    context?.onGenerateTextEnd?.(endEvent);

    return { ok: false, error: result.error };
  }

  const extractedOutput = await extractOutput(result.output);
  const processedOutput = await processOutput(extractedOutput);

  const endEvent: GenerateTextEndEvent = {
    type: "generate-text-end",
    status: "success",
    metadata,
    input: expandedPrompt,
    rawOutput: result.output,
    extractedOutput,
    processedOutput,
  };

  onEnd?.(endEvent);
  context?.onGenerateTextEnd?.(endEvent);

  return { ok: true, output: processedOutput };
}
