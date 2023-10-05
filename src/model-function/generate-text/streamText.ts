import { ModelCallMetadata } from "model-function/ModelCallMetadata.js";
import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../../core/FunctionEventSource.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { getGlobalFunctionLogging } from "../../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../../core/GlobalFunctionObservers.js";
import { AbortError } from "../../core/api/AbortError.js";
import { getFunctionCallLogger } from "../../core/getFunctionCallLogger.js";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { runSafe } from "../../util/runSafe.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { Delta } from "../Delta.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import {
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./TextStreamingEvent.js";

type TextStreamingModel<PROMPT> = TextGenerationModel<
  PROMPT,
  TextGenerationModelSettings
> & {
  doStreamText: (
    prompt: PROMPT,
    options: FunctionOptions
  ) => PromiseLike<AsyncIterable<Delta<string>>>;
};

export function streamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions
): AsyncIterableResultPromise<string> {
  return new AsyncIterableResultPromise<string>(
    doStreamText(model, prompt, options)
  );
}

async function doStreamText<PROMPT>(
  model: TextStreamingModel<PROMPT>,
  prompt: PROMPT,
  options?: FunctionOptions
): Promise<{
  output: AsyncIterable<string>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}> {
  const run = options?.run;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getGlobalFunctionLogging()),
      ...getGlobalFunctionObservers(),
      ...(model.settings.observers ?? []),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    functionType: "text-streaming" as const,

    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,

    model: model.modelInformation,
    settings: model.settingsForEvent,
    input: prompt,

    timestamp: durationMeasurement.startDate,
    startTimestamp: durationMeasurement.startDate,
  };

  eventSource.notify({
    eventType: "started",
    ...startMetadata,
  } satisfies TextStreamingStartedEvent);

  const result = await runSafe(async () => {
    const deltaIterable = await model.doStreamText(prompt, options);

    return (async function* () {
      let accumulatedText = "";
      let lastFullDelta: unknown | undefined;

      for await (const event of deltaIterable) {
        if (event?.type === "error") {
          const error = event.error;

          const finishMetadata = {
            eventType: "finished" as const,
            ...startMetadata,
            finishTimestamp: new Date(),
            durationInMs: durationMeasurement.durationInMs,
          };

          eventSource.notify(
            error instanceof AbortError
              ? {
                  ...finishMetadata,
                  result: {
                    status: "abort",
                  },
                }
              : {
                  ...finishMetadata,
                  result: {
                    status: "error",
                    error,
                  },
                }
          );

          throw error;
        }

        if (event?.type === "delta") {
          lastFullDelta = event.fullDelta;

          const textDelta = event.valueDelta;

          if (textDelta != null && textDelta.length > 0) {
            accumulatedText += textDelta;
            yield textDelta;
          }
        }
      }

      const finishMetadata = {
        eventType: "finished" as const,
        ...startMetadata,
        finishTimestamp: new Date(),
        durationInMs: durationMeasurement.durationInMs,
      };

      eventSource.notify({
        ...finishMetadata,
        result: {
          status: "success",
          response: lastFullDelta,
          value: accumulatedText,
        },
      } satisfies TextStreamingFinishedEvent);
    })();
  });

  if (!result.ok) {
    const finishMetadata = {
      eventType: "finished" as const,
      ...startMetadata,
      finishTimestamp: new Date(),
      durationInMs: durationMeasurement.durationInMs,
    };

    if (result.isAborted) {
      eventSource.notify({
        ...finishMetadata,
        result: {
          status: "abort",
        },
      });
      throw new AbortError();
    }

    eventSource.notify({
      ...finishMetadata,
      result: {
        status: "error",
        error: result.error,
      },
    });
    throw result.error;
  }

  return {
    output: result.value,
    metadata: startMetadata,
  };
}
