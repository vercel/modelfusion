import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "./TranscriptionModel.js";

/**
 * Transcribe audio data into text.
 *
 * @example
 * const data = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await generateTranscription(
 *   new OpenAITranscriptionModel({ model: "whisper-1" }),
 *   {
 *     type: "mp3",
 *     data,
 *   }
 * );
 */
export function generateTranscription<DATA>(
  model: TranscriptionModel<DATA, TranscriptionModelSettings>,
  data: DATA,
  options?: FunctionOptions
): ModelFunctionPromise<string> {
  return new ModelFunctionPromise(
    executeStandardCall({
      functionType: "generate-transcription",
      input: data,
      model,
      options,
      generateResponse: async (options) => {
        const result = await model.doTranscribe(data, options);

        return {
          response: result.response,
          extractedValue: result.transcription,
        };
      },
    })
  );
}
