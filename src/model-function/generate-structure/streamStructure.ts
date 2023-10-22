import { FunctionOptions } from "../../core/FunctionOptions.js";
import { StructureDefinition } from "../../core/structure/StructureDefinition.js";
import { isDeepEqualData } from "../../util/isDeepEqualData.js";
import { AsyncIterableResultPromise } from "../AsyncIterableResultPromise.js";
import { executeStreamCall } from "../executeStreamCall.js";
import { StructureStreamingModel } from "./StructureGenerationModel.js";

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
  let lastStructure: unknown | undefined;
  let lastFullDelta: unknown | undefined;

  return new AsyncIterableResultPromise<StructureStreamPart<STRUCTURE>>(
    executeStreamCall<
      unknown,
      StructureStreamPart<STRUCTURE>,
      StructureStreamingModel<PROMPT>
    >({
      functionType: "stream-structure",
      input: prompt,
      model,
      options,
      startStream: async (options) =>
        model.doStreamStructure(structureDefinition, prompt, options),
      processDelta: (delta) => {
        const latestFullDelta = delta.fullDelta;
        const latestStructure = delta.valueDelta;

        // only send a new part into the stream when the partial structure has changed:
        if (!isDeepEqualData(lastStructure, latestStructure)) {
          lastFullDelta = latestFullDelta;
          lastStructure = latestStructure;

          return {
            isComplete: false,
            value: lastStructure,
          } satisfies StructureStreamPart<STRUCTURE>;
        }

        return undefined;
      },
      processFinished: () => {
        // process the final result (full type validation):
        const parseResult = structureDefinition.schema.validate(lastStructure);

        if (!parseResult.success) {
          reportError(parseResult.error);
          throw parseResult.error;
        }

        return {
          isComplete: true,
          value: parseResult.data,
        };
      },
      getResult: () => ({
        response: lastFullDelta,
        value: lastStructure,
      }),
    })
  );
}
