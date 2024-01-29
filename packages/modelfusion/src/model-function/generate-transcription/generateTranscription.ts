import { FunctionOptions } from "../../core/FunctionOptions";
import { AudioMimeType } from "../../util/audio/AudioMimeType";
import { DataContent } from "../../util/format/DataContent";
import { ModelCallMetadata } from "../ModelCallMetadata";
import { executeStandardCall } from "../executeStandardCall";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "./TranscriptionModel";

/**
 * Transcribe audio data into text. Also called speech-to-text (STT) or automatic speech recognition (ASR).
 *
 * @see https://modelfusion.dev/guide/function/generate-transcription
 *
 * @example
 * const audioData = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await generateTranscription({
 *   model: openai.Transcriber({ model: "whisper-1" }),
 *   mimeType: "audio/mp3",
 *   audioData,
 * });
 *
 * @param {TranscriptionModel<DATA, TranscriptionModelSettings>} options.model - The model to use for transcription.
 * @param {AudioMimeType} options.model - The MIME type of the audio data.
 * @param {DataContent} options.model - The audio data to transcribe. Can be a base64-encoded string, a Uint8Array, or a Buffer.
 *
 * @returns {Promise<string>} A promise that resolves to the transcribed text.
 */
export async function generateTranscription(
  args: {
    model: TranscriptionModel<TranscriptionModelSettings>;
    mimeType: AudioMimeType | (string & {}); // eslint-disable-line @typescript-eslint/ban-types
    audioData: DataContent;
    fullResponse?: false;
  } & FunctionOptions
): Promise<string>;
export async function generateTranscription(
  args: {
    model: TranscriptionModel<TranscriptionModelSettings>;
    mimeType: AudioMimeType | (string & {}); // eslint-disable-line @typescript-eslint/ban-types
    audioData: DataContent;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  value: string;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function generateTranscription({
  model,
  audioData,
  mimeType,
  fullResponse,
  ...options
}: {
  model: TranscriptionModel<TranscriptionModelSettings>;
  mimeType: AudioMimeType | (string & {}); // eslint-disable-line @typescript-eslint/ban-types
  audioData: DataContent;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  string | { value: string; rawResponse: unknown; metadata: ModelCallMetadata }
> {
  const input = { mimeType, audioData };

  const callResponse = await executeStandardCall({
    functionType: "generate-transcription",
    input,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doTranscribe(input, options);
      return {
        rawResponse: result.rawResponse,
        extractedValue: result.transcription,
      };
    },
  });

  return fullResponse ? callResponse : callResponse.value;
}
