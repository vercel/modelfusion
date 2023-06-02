import { createId } from "@paralleldrive/cuid2";
import {
  GenerateCallEndEvent,
  GenerateCallStartEvent,
} from "run/GenerateCallEvent.js";
import { Prompt } from "../../run/Prompt.js";
import { RunContext } from "../../run/RunContext.js";
import { RunFunction, SafeRunFunction } from "../../run/RunFunction.js";
import { AbortError } from "../../util/AbortError.js";
import { SafeResult } from "../../util/SafeResult.js";
import { RetryFunction } from "../../util/retry/RetryFunction.js";
import { runSafe } from "../../util/runSafe.js";
import { ImageGenerationModel } from "./ImageGenerationModel.js";

export async function generateImage<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  input: Parameters<
    typeof safeGenerateImage<INPUT, PROMPT_TYPE, RAW_OUTPUT>
  >[0],
  context?: RunContext
): Promise<string> {
  const result = await safeGenerateImage(input, context);

  if (!result.ok) {
    if (result.isAborted) {
      throw new AbortError("The generation was aborted.");
    }

    throw result.error;
  }

  return result.output;
}

/**
 * @example
 * const generatePainting = generateImage.asFunction({
 *   model,
 *   prompt: async ({ description }: { description: string }) => [
 *     { text: description },
 *     { text: "style of early 19th century painting", weight: 0.5 },
 *   ],
 * });
 *
 * const imageBase64 = await generatePainting({
 *   description: "the wicked witch of the west",
 * });
 */
generateImage.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: ImageGenerationModel<PROMPT_TYPE, RAW_OUTPUT>;
    extractBase64Image?: (output: RAW_OUTPUT) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }): RunFunction<INPUT, string> =>
  async (input: INPUT, context?: RunContext) =>
    generateImage({ input, ...options }, context);

generateImage.safe = safeGenerateImage;

generateImage.asSafeFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: ImageGenerationModel<PROMPT_TYPE, RAW_OUTPUT>;
    extractOutput?: (output: RAW_OUTPUT) => PromiseLike<string>;
    retry?: RetryFunction;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  }): SafeRunFunction<INPUT, string> =>
  async (input: INPUT, context?: RunContext) =>
    safeGenerateImage({ input, ...options }, context);

async function safeGenerateImage<INPUT, PROMPT_TYPE, RAW_OUTPUT>(
  {
    functionId,
    prompt,
    input,
    model,
    extractBase64Image = model.extractImageBase64,
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: Prompt<INPUT, PROMPT_TYPE>;
    model: ImageGenerationModel<PROMPT_TYPE, RAW_OUTPUT>;
    extractBase64Image?: (output: RAW_OUTPUT) => PromiseLike<string>;
    onCallStart?: (call: GenerateCallStartEvent) => void;
    onCallEnd?: (call: GenerateCallEndEvent) => void;
  },
  context?: RunContext
): Promise<SafeResult<string>> {
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

  const callStartEvent: GenerateCallStartEvent = {
    type: "generate-start",
    metadata: startMetadata,
    input: expandedPrompt,
  };

  onCallStart?.(callStartEvent);
  context?.onCallStart?.(callStartEvent);

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
      const callEndEvent: GenerateCallEndEvent = {
        type: "generate-end",
        status: "abort",
        metadata,
        input: expandedPrompt,
      };

      onCallEnd?.(callEndEvent);
      context?.onCallEnd?.(callEndEvent);

      return { ok: false, isAborted: true };
    }

    const callEndEvent: GenerateCallEndEvent = {
      type: "generate-end",
      status: "failure",
      metadata,
      input: expandedPrompt,
      error: result.error,
    };

    onCallEnd?.(callEndEvent);
    context?.onCallEnd?.(callEndEvent);

    return { ok: false, error: result.error };
  }

  const image = await extractBase64Image(result.output);

  const callEndEvent: GenerateCallEndEvent = {
    type: "generate-end",
    status: "success",
    metadata,
    input: expandedPrompt,
    rawOutput: result.output,
    extractedOutput: image,
    processedOutput: image,
  };

  onCallEnd?.(callEndEvent);
  context?.onCallEnd?.(callEndEvent);

  return { ok: true, output: image };
}
