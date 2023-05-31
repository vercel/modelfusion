import { createId } from "@paralleldrive/cuid2";
import {
  EmbedCallEndEvent,
  EmbedCallStartEvent,
} from "../../run/EmbedCallEvent.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { RetryFunction } from "../../util/retry/RetryFunction.js";
import { retryWithExponentialBackoff } from "../../util/retry/retryWithExponentialBackoff.js";
import { runSafe } from "../../util/runSafe.js";
import { TextEmbeddingModel } from "./TextEmbeddingModel.js";

export async function embedText<RAW_OUTPUT, EMBEDDING>(
  {
    functionId,
    model,
    texts,
    retry = retryWithExponentialBackoff(),
    onCallStart,
    onCallEnd,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT, EMBEDDING>;
    texts: Array<string>;
    retry?: RetryFunction;
    onCallStart?: (call: EmbedCallStartEvent) => void;
    onCallEnd?: (call: EmbedCallEndEvent) => void;
  },
  context?: RunContext
): Promise<Array<EMBEDDING>> {
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

  const callStartEvent: EmbedCallStartEvent = {
    type: "embed-start",
    metadata: startMetadata,
    texts,
  };

  onCallStart?.(callStartEvent);
  context?.onCallStart?.(callStartEvent);

  const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: textGenerationDurationInMs,
    ...startMetadata,
  };

  // split the texts into groups:
  const maxTextsPerCall = model.maxTextsPerCall;
  const textGroups = [];
  for (let i = 0; i < texts.length; i += maxTextsPerCall) {
    textGroups.push(texts.slice(i, i + maxTextsPerCall));
  }

  // embed each group:
  const rawOutputs: Array<RAW_OUTPUT> = [];
  for (const textGroup of textGroups) {
    const result = await runSafe(() =>
      retry(() => model.embed(textGroup, context))
    );

    if (!result.ok) {
      if (result.isAborted) {
        const callEndEvent: EmbedCallEndEvent = {
          type: "embed-end",
          status: "abort",
          metadata,
          texts,
        };

        onCallEnd?.(callEndEvent);
        context?.onCallEnd?.(callEndEvent);

        throw new AbortError();
      }

      const callEndEvent: EmbedCallEndEvent = {
        type: "embed-end",
        status: "failure",
        metadata,
        texts,
        error: result.error,
      };

      onCallEnd?.(callEndEvent);
      context?.onCallEnd?.(callEndEvent);

      throw result.error;
    }

    rawOutputs.push(result.output);
  }

  // combine the results:
  const embeddings: Array<EMBEDDING> = [];
  for (const rawOutput of rawOutputs) {
    embeddings.push(...(await model.extractEmbeddings(rawOutput)));
  }

  const callEndEvent: EmbedCallEndEvent = {
    type: "embed-end",
    status: "success",
    metadata,
    texts,
    rawOutputs,
    embeddings,
  };

  onCallEnd?.(callEndEvent);
  context?.onCallEnd?.(callEndEvent);

  return embeddings;
}

embedText.asFunction =
  <RAW_OUTPUT, EMBEDDING>({
    functionId,
    model,
  }: {
    functionId?: string;
    model: TextEmbeddingModel<RAW_OUTPUT, EMBEDDING>;
  }) =>
  async ({ texts }: { texts: Array<string> }, context?: RunContext) =>
    embedText({ functionId, model, texts }, context);
