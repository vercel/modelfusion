import { createId } from "@paralleldrive/cuid2";
import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "text/generate/GenerateTextEvent.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { RunFunction } from "../../run/RunFunction.js";
import { AbortError } from "../../util/AbortError.js";
import { SafeResult } from "../../util/SafeResult.js";
import { runSafe } from "../../util/runSafe.js";
import { GenerateTextObserver } from "./GenerateTextObserver.js";
import { TextGenerationModel } from "./TextGenerationModel.js";

export async function generateValueFromText<
  INPUT,
  PROMPT_TYPE,
  RAW_OUTPUT,
  OUTPUT
>(
  input: Parameters<
    typeof safeGenerateValueFromText<INPUT, PROMPT_TYPE, RAW_OUTPUT, OUTPUT>
  >[0],
  context?: RunContext & GenerateTextObserver
): Promise<OUTPUT> {
  const result = await safeGenerateValueFromText(input, context);

  if (!result.ok) {
    if (result.isAborted) {
      throw new AbortError("The generation was aborted.");
    }

    throw result.error;
  }

  return result.output;
}

generateValueFromText.asFunction =
  <INPUT, PROMPT_TYPE, RAW_OUTPUT, OUTPUT>(options: {
    functionId?: string | undefined;
    prompt: PromptTemplate<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT>;
    processText: (text: string) => PromiseLike<OUTPUT>;
    onStart?: (event: GenerateTextStartEvent) => void;
    onEnd?: (event: GenerateTextEndEvent) => void;
  }): RunFunction<INPUT, OUTPUT> =>
  async (input: INPUT, context?: RunContext & GenerateTextObserver) =>
    generateValueFromText({ input, ...options }, context);

async function safeGenerateValueFromText<
  INPUT,
  PROMPT_TYPE,
  RAW_OUTPUT,
  OUTPUT
>(
  {
    functionId,
    prompt,
    input,
    model,
    processText,
    onStart,
    onEnd,
  }: {
    functionId?: string | undefined;
    input: INPUT;
    prompt: PromptTemplate<INPUT, PROMPT_TYPE>;
    model: TextGenerationModel<PROMPT_TYPE, RAW_OUTPUT>;
    processText: (text: string) => PromiseLike<OUTPUT>;
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

  const generationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: generationDurationInMs,
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

  const extractedText = await model.extractText(result.output);
  const processedOutput = await processText(extractedText);

  const endEvent: GenerateTextEndEvent = {
    type: "generate-text-end",
    status: "success",
    metadata,
    input: expandedPrompt,
    rawOutput: result.output,
    extractedText,
    processedOutput,
  };

  onEnd?.(endEvent);
  context?.onGenerateTextEnd?.(endEvent);

  return { ok: true, output: processedOutput };
}
