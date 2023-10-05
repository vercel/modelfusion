import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelFunctionPromise, executeCall } from "../executeCall.js";
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
 * const transcription = await transcribe(
 *   new OpenAITranscriptionModel({ model: "whisper-1" }),
 *   {
 *     type: "mp3",
 *     data,
 *   }
 * );
 */
export function transcribe<DATA>(
  model: TranscriptionModel<DATA, TranscriptionModelSettings>,
  data: DATA,
  options?: FunctionOptions
): ModelFunctionPromise<string> {
  return executeCall({
    functionType: "transcription",
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
  });
}
