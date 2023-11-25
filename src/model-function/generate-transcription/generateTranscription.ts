import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
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
 *   openai.Transcriber({ model: "whisper-1" }),
 *   { type: "mp3", data }
 * );
 *
 * @param {TranscriptionModel<DATA, TranscriptionModelSettings>} model - The model to use for transcription.
 * @param {DATA} data - The data to transcribe.
 * @param {FunctionOptions} [options] - Optional parameters for the function.
 *
 * @returns {Promise<string>} A promise that resolves to the transcribed text.
 */
export async function generateTranscription<DATA>(
  model: TranscriptionModel<DATA, TranscriptionModelSettings>,
  data: DATA,
  options?: FunctionOptions & { returnType?: "text" }
): Promise<string>;
export async function generateTranscription<DATA>(
  model: TranscriptionModel<DATA, TranscriptionModelSettings>,
  data: DATA,
  options: FunctionOptions & { returnType: "full" }
): Promise<{ value: string; response: unknown; metadata: ModelCallMetadata }>;
export async function generateTranscription<DATA>(
  model: TranscriptionModel<DATA, TranscriptionModelSettings>,
  data: DATA,
  options?: FunctionOptions & { returnType?: "text" | "full" }
): Promise<
  string | { value: string; response: unknown; metadata: ModelCallMetadata }
> {
  const fullResponse = await executeStandardCall({
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
  });

  return options?.returnType === "full" ? fullResponse : fullResponse.value;
}
