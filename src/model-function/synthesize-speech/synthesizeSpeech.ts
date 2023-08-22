import { FunctionOptions } from "../FunctionOptions.js";
import { CallMetadata, executeCall } from "../executeCall.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "./SpeechSynthesisModel.js";

/**
 * Synthesizes speech from text.
 */
export async function synthesizeSpeech<
  SETTINGS extends SpeechSynthesisModelSettings,
>(
  model: SpeechSynthesisModel<SETTINGS>,
  text: string,
  options: FunctionOptions<SETTINGS> & {
    fullResponse: true;
  }
): Promise<{
  speech: Buffer;
  metadata: CallMetadata<SpeechSynthesisModel<SETTINGS>>;
}>;
export async function synthesizeSpeech<
  SETTINGS extends SpeechSynthesisModelSettings,
>(
  model: SpeechSynthesisModel<SETTINGS>,
  text: string,
  options?: FunctionOptions<SETTINGS> & {
    fullResponse?: false;
  }
): Promise<Buffer>;
export async function synthesizeSpeech<
  SETTINGS extends SpeechSynthesisModelSettings,
>(
  model: SpeechSynthesisModel<SETTINGS>,
  text: string,
  options?: FunctionOptions<SETTINGS> & {
    fullResponse?: boolean;
  }
): Promise<
  | {
      speech: Buffer;
      metadata: CallMetadata<SpeechSynthesisModel<SETTINGS>>;
    }
  | Buffer
> {
  const result = await executeCall({
    model,
    options,
    generateResponse: (options) => model.generateSpeechResponse(text, options),
    extractOutputValue: (buffer) => buffer,
    getStartEvent: (metadata, settings) => ({
      type: "speech-synthesis-started",
      metadata,
      settings,
      text,
    }),
    getAbortEvent: (metadata, settings) => ({
      type: "speech-synthesis-finished",
      status: "abort",
      settings,
      metadata,
      text,
    }),
    getFailureEvent: (metadata, settings, error) => ({
      type: "speech-synthesis-finished",
      status: "failure",
      metadata,
      settings,
      text,
      error,
    }),
    getSuccessEvent: (metadata, settings, response, output) => ({
      type: "speech-synthesis-finished",
      status: "success",
      metadata,
      settings,
      text,
      response,
      speech: output,
    }),
  });

  return options?.fullResponse === true
    ? {
        speech: result.output,
        metadata: result.metadata,
      }
    : result.output;
}
