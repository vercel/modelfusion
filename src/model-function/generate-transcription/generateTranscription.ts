import { FunctionOptions } from "../../core/FunctionOptions.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { ModelFunctionPromise } from "../ModelFunctionPromise.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "./TranscriptionModel.js";

/**
 * Transcribe audio data into text. Also called speech-to-text (STT) or automatic speech recognition (ASR).
 *
 * @see https://modelfusion.dev/guide/function/generate-transcription
 *
 * @example
 * const data = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await generateTranscription(
 *   new OpenAITranscriptionModel({ model: "whisper-1" }),
 *   { type: "mp3", data }
 * );
 *
 * @param {TranscriptionModel<DATA, TranscriptionModelSettings>} model - The model to use for transcription.
 * @param {DATA} data - The data to transcribe.
 * @param {FunctionOptions} [options] - Optional parameters for the function.
 *
 * @returns {ModelFunctionPromise<string>} A promise that resolves to the transcribed text.
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
