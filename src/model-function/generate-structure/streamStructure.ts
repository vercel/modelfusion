import deepEqual from "deep-equal";
import { ModelCallMetadata } from "model-function/ModelCallMetadata.js";
import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../../core/FunctionEventSource.js";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { getGlobalFunctionLogging } from "../../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../../core/GlobalFunctionObservers.js";
import { AbortError } from "../../core/api/AbortError.js";
import { getFunctionCallLogger } from "../../core/getFunctionCallLogger.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { runSafe } from "../../util/runSafe.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { StructureStreamingModel } from "./StructureGenerationModel.js";
import {
  StructureStreamingFinishedEvent,
  StructureStreamingStartedEvent,
} from "./StructureStreamingEvent.js";

export type StructureStreamPart<STRUCTURE> =
  | {
      isComplete: false;
      value: unknown;
    }
  | {
      isComplete: true;
      value: STRUCTURE;
    };

export function streamStructure<STRUCTURE, PROMPT, NAME extends string>(
  model: StructureStreamingModel<PROMPT>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt: PROMPT,
  options?: FunctionOptions
): AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>> {
  return new AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>(
    doStreamStructure(model, structureDefinition, prompt, options)
  );
}

async function doStreamStructure<STRUCTURE, PROMPT, NAME extends string>(
  model: StructureStreamingModel<PROMPT>,
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt: PROMPT,
  options?: FunctionOptions
): Promise<{
  output: AsyncIterable<StructureStreamPart<STRUCTURE>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}> {
  const run = options?.run;
  const settings = model.settings;

  const eventSource = new FunctionEventSource({
    observers: [
      ...getFunctionCallLogger(options?.logging ?? getGlobalFunctionLogging()),
      ...getGlobalFunctionObservers(),
      ...(settings.observers ?? []),
      ...(run?.functionObserver != null ? [run.functionObserver] : []),
      ...(options?.observers ?? []),
    ],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    functionType: "structure-streaming" as const,

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
  } satisfies StructureStreamingStartedEvent);

  const result = await runSafe(async () => {
    const deltaIterable = await model.doStreamStructure(
      structureDefinition,
      prompt,
      options
    );

    return (async function* () {
      function reportError(error: unknown) {
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
      }

      let lastStructure: unknown | undefined;
      let lastFullDelta: unknown | undefined;

      for await (const event of deltaIterable) {
        if (event?.type === "error") {
          reportError(event.error);
          throw event.error;
        }

        if (event?.type === "delta") {
          const latestFullDelta = event.fullDelta;
          const latestStructure = event.valueDelta;

          // only send a new part into the stream when the partial structure has changed:
          if (
            !deepEqual(lastStructure, latestStructure, {
              strict: true,
            })
          ) {
            lastFullDelta = latestFullDelta;
            lastStructure = latestStructure;

            yield {
              isComplete: false,
              value: lastStructure,
            } satisfies StructureStreamPart<STRUCTURE>;
          }
        }
      }

      // process the final result (full type validation):
      const parseResult = structureDefinition.schema.validate(lastStructure);

      if (!parseResult.success) {
        reportError(parseResult.error);
        throw parseResult.error;
      }

      yield {
        isComplete: true,
        value: parseResult.value,
      };

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
          value: lastStructure,
        },
      } satisfies StructureStreamingFinishedEvent);
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
