import deepEqual from "deep-equal";
import { nanoid as createId } from "nanoid";
import { FunctionEventSource } from "../../core/FunctionEventSource.js";
import { getGlobalFunctionLogging } from "../../core/GlobalFunctionLogging.js";
import { getGlobalFunctionObservers } from "../../core/GlobalFunctionObservers.js";
import { AbortError } from "../../core/api/AbortError.js";
import { getFunctionCallLogger } from "../../core/getFunctionCallLogger.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { runSafe } from "../../util/runSafe.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { DeltaEvent } from "../DeltaEvent.js";
import { ModelFunctionOptions } from "../ModelFunctionOptions.js";
import { ModelCallMetadata } from "../executeCall.js";
import {
  StructureGenerationModel,
  StructureGenerationModelSettings,
} from "./StructureGenerationModel.js";
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

export function streamStructure<
  STRUCTURE,
  PROMPT,
  FULL_DELTA,
  NAME extends string,
  SETTINGS extends StructureGenerationModelSettings,
>(
  model: StructureGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS> & {
    generateStructureStreamResponse: (
      structureDefinition: StructureDefinition<NAME, STRUCTURE>,
      prompt: PROMPT,
      options: ModelFunctionOptions<SETTINGS>
    ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    extractPartialStructure: (fullDelta: FULL_DELTA) => unknown | undefined;
  },
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt: PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>> {
  return new AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>(
    doStreamStructure(model, structureDefinition, prompt, options)
  );
}

async function doStreamStructure<
  STRUCTURE,
  PROMPT,
  FULL_DELTA,
  NAME extends string,
  SETTINGS extends StructureGenerationModelSettings,
>(
  model: StructureGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS> & {
    generateStructureStreamResponse: (
      structureDefinition: StructureDefinition<NAME, STRUCTURE>,
      prompt: PROMPT,
      options: ModelFunctionOptions<SETTINGS>
    ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    extractPartialStructure: (fullDelta: FULL_DELTA) => unknown | undefined;
  },
  structureDefinition: StructureDefinition<NAME, STRUCTURE>,
  prompt: PROMPT,
  options?: ModelFunctionOptions<SETTINGS>
): Promise<{
  output: AsyncIterable<StructureStreamPart<STRUCTURE>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}> {
  if (options?.settings != null) {
    model = model.withSettings(options.settings);
    options = {
      functionId: options.functionId,
      observers: options.observers,
      run: options.run,
    };
  }

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
    const deltaIterable = await model.generateStructureStreamResponse(
      structureDefinition,
      prompt,
      {
        functionId: options?.functionId,
        settings, // options.setting is null here because of the initial guard
        run,
      }
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
      let lastFullDelta: FULL_DELTA | undefined;

      for await (const event of deltaIterable) {
        if (event?.type === "error") {
          reportError(event.error);
          throw event.error;
        }

        if (event?.type === "delta") {
          const latestFullDelta = event.fullDelta;
          const latestStructure =
            model.extractPartialStructure(latestFullDelta);

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
          output: lastStructure,
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
    output: result.output,
    metadata: startMetadata,
  };
}
