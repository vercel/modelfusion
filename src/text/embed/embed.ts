import { createId } from "@paralleldrive/cuid2";
import {
  EmbedCallEndEvent,
  EmbedCallStartEvent,
} from "../../run/EmbedCallEvent.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { RetryFunction } from "../../util/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../util/retryWithExponentialBackoff.js";
import { EmbeddingModel } from "./EmbeddingModel.js";

export async function embed<RAW_OUTPUT, GENERATED_OUTPUT>(
  {
    functionId,
    model,
    value,
    retry = retryWithExponentialBackoff(),
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string;
    model: EmbeddingModel<RAW_OUTPUT, GENERATED_OUTPUT>;
    value: string;
    retry?: RetryFunction;
    onCallStart?: (call: EmbedCallStartEvent) => void;
    onCallEnd?: (call: EmbedCallEndEvent) => void;
  },
  context?: RunContext
): Promise<GENERATED_OUTPUT> {
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
      vendor: model.vendor,
      name: model.model,
    },
    startEpochSeconds,
  };

  const callStartEvent: EmbedCallStartEvent = {
    type: "embed-start",
    metadata: startMetadata,
    input: value,
  };

  onCallStart?.(callStartEvent);
  context?.onCallStart?.(callStartEvent);

  const rawOutput = await retry(() => model.embed(value, context));

  const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: textGenerationDurationInMs,
    tries: rawOutput.tries,
    ...startMetadata,
  };

  if (rawOutput.status === "failure") {
    const callEndEvent: EmbedCallEndEvent = {
      type: "embed-end",
      status: "failure",
      metadata,
      input: value,
      error: rawOutput.error,
    };

    onCallEnd?.(callEndEvent);
    context?.onCallEnd?.(callEndEvent);

    throw rawOutput.error;
  }

  if (rawOutput.status === "abort") {
    const callEndEvent: EmbedCallEndEvent = {
      type: "embed-end",
      status: "abort",
      metadata,
      input: value,
    };

    onCallEnd?.(callEndEvent);
    context?.onCallEnd?.(callEndEvent);

    throw new AbortError();
  }

  const embedding = await model.extractEmbedding(rawOutput.result);

  const callEndEvent: EmbedCallEndEvent = {
    type: "embed-end",
    status: "success",
    metadata,
    input: value,
    rawOutput: rawOutput.result,
    embedding,
  };

  onCallEnd?.(callEndEvent);
  context?.onCallEnd?.(callEndEvent);

  return embedding;
}

embed.asFunction =
  <RAW_OUTPUT, GENERATED_OUTPUT>({
    id,
    model,
  }: {
    id?: string;
    model: EmbeddingModel<RAW_OUTPUT, GENERATED_OUTPUT>;
  }) =>
  async ({ value }: { value: string }, context: RunContext) =>
    embed({ functionId: id, model, value }, context);
