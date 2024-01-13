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
 * const transcription = await generateTranscription({
 *   model: openai.Transcriber({ model: "whisper-1" }),
 *   data: { type: "mp3", data }
 * });
 *
 * @param {TranscriptionModel<DATA, TranscriptionModelSettings>} model - The model to use for transcription.
 * @param {DATA} data - The data to transcribe.
 *
 * @returns {Promise<string>} A promise that resolves to the transcribed text.
 */
export async function generateTranscription<DATA>(
  args: {
    model: TranscriptionModel<DATA, TranscriptionModelSettings>;
    data: DATA;
    fullResponse?: false;
  } & FunctionOptions
): Promise<string>;
export async function generateTranscription<DATA>(
  args: {
    model: TranscriptionModel<DATA, TranscriptionModelSettings>;
    data: DATA;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  value: string;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateTranscription<DATA>({
  model,
  data,
  fullResponse,
  ...options
}: {
  model: TranscriptionModel<DATA, TranscriptionModelSettings>;
  data: DATA;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  string | { value: string; rawResponse: unknown; metadata: ModelCallMetadata }
> {
  const callResponse = await executeStandardCall({
    functionType: "generate-transcription",
    input: data,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doTranscribe(data, options);
      return {
        rawResponse: result.rawResponse,
        extractedValue: result.transcription,
      };
    },
  });

  return fullResponse ? callResponse : callResponse.value;
}
