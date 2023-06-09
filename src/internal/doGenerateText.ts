import { ModelInformation } from "../run/ModelInformation.js";
import { RunContext } from "../run/RunContext.js";
import { RunObserver } from "../run/RunObserver.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "../text/generate/TextGenerationObserver.js";
import { AbortError } from "../util/AbortError.js";
import { runSafe } from "../util/runSafe.js";

export async function doGenerateText<RESPONSE>({
  model,
  prompt,
  generate,
  extractText,
  createId,
  uncaughtErrorHandler,
  observers: otherObservers,
  context,
}: {
  model: ModelInformation;
  prompt: string;
  generate: () => PromiseLike<RESPONSE>;
  extractText: (response: RESPONSE) => PromiseLike<string>;
  createId: () => string;
  uncaughtErrorHandler: (error: unknown) => void;
  observers: RunObserver[] | undefined;
  context?: RunContext;
}) {
  const startTime = performance.now();
  const startEpochSeconds = Math.floor(
    (performance.timeOrigin + startTime) / 1000
  );

  const callId = createId();

  const startMetadata = {
    generateTextCallId: callId,
    runId: context?.runId,
    sessionId: context?.sessionId,
    userId: context?.userId,

    model,

    startEpochSeconds,
  };

  const startEvent: TextGenerationStartedEvent = {
    type: "text-generation-started",
    metadata: startMetadata,
    prompt,
  };

  const observers = [...(otherObservers ?? []), ...(context?.observers ?? [])];

  observers.forEach((observer) => {
    try {
      observer?.onTextGenerationStarted?.(startEvent);
    } catch (error) {
      uncaughtErrorHandler(error);
    }
  });

  const result = await runSafe(generate);

  const generationDurationInMs = Math.ceil(performance.now() - startTime);

  const metadata = {
    durationInMs: generationDurationInMs,
    ...startMetadata,
  };

  if (!result.ok) {
    if (result.isAborted) {
      const endEvent: TextGenerationFinishedEvent = {
        type: "text-generation-finished",
        status: "abort",
        metadata,
        prompt,
      };

      observers.forEach((observer) => {
        try {
          observer?.onTextGenerationFinished?.(endEvent);
        } catch (error) {
          uncaughtErrorHandler(error);
        }
      });

      throw new AbortError();
    }

    const endEvent: TextGenerationFinishedEvent = {
      type: "text-generation-finished",
      status: "failure",
      metadata,
      prompt,
      error: result.error,
    };

    observers.forEach((observer) => {
      try {
        observer?.onTextGenerationFinished?.(endEvent);
      } catch (error) {
        uncaughtErrorHandler(error);
      }
    });

    // TODO instead throw a generate text error with a cause?
    throw result.error;
  }

  const extractedText = await extractText(result.output);

  const endEvent: TextGenerationFinishedEvent = {
    type: "text-generation-finished",
    status: "success",
    metadata,
    prompt,
    generatedText: extractedText,
  };

  observers.forEach((observer) => {
    try {
      observer?.onTextGenerationFinished?.(endEvent);
    } catch (error) {
      uncaughtErrorHandler(error);
    }
  });

  return extractedText;
}
