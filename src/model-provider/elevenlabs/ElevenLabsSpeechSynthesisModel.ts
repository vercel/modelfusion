import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { AsyncQueue } from "../../event-source/AsyncQueue.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import {
  SpeechSynthesisModel,
  SpeechSynthesisModelSettings,
} from "../../model-function/synthesize-speech/SpeechSynthesisModel.js";
import { createSimpleWebSocket } from "../../util/SimpleWebSocket.js";
import { ElevenLabsApiConfiguration } from "./ElevenLabsApiConfiguration.js";
import { failedElevenLabsCallResponseHandler } from "./ElevenLabsError.js";

const elevenLabsModels = [
  "eleven_multilingual_v2",
  "eleven_multilingual_v1",
  "eleven_monolingual_v1",
] as const;

const defaultModel = "eleven_multilingual_v2";

export interface ElevenLabsSpeechSynthesisModelSettings
  extends SpeechSynthesisModelSettings {
  api?: ApiConfiguration & {
    apiKey: string;
  };

  voice: string;

  model?:
    | (typeof elevenLabsModels)[number]
    // string & {} is used to enable auto-completion of literals
    // while also allowing strings:
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});

  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * Synthesize speech using the ElevenLabs Text to Speech API.
 *
 * @see https://api.elevenlabs.io/docs#/text-to-speech/Text_to_speech_v1_text_to_speech__voice_id__post
 */
export class ElevenLabsSpeechSynthesisModel
  extends AbstractModel<ElevenLabsSpeechSynthesisModelSettings>
  implements SpeechSynthesisModel<ElevenLabsSpeechSynthesisModelSettings>
{
  constructor(settings: ElevenLabsSpeechSynthesisModelSettings) {
    super({ settings });
  }

  readonly provider = "elevenlabs";

  get modelName() {
    return this.settings.voice;
  }

  private async callAPI(
    text: string,
    options?: FunctionOptions
  ): Promise<Buffer> {
    return callWithRetryAndThrottle({
      retry: this.settings.api?.retry,
      throttle: this.settings.api?.throttle,
      call: async () =>
        callElevenLabsTextToSpeechAPI({
          api: this.settings.api,
          abortSignal: options?.run?.abortSignal,
          text,
          voiceId: this.settings.voice,
          modelId: this.settings.model,
          voiceSettings: this.settings.voiceSettings,
        }),
    });
  }

  get settingsForEvent(): Partial<ElevenLabsSpeechSynthesisModelSettings> {
    return {
      model: this.settings.model,
      voice: this.settings.voice,
      voiceSettings: this.settings.voiceSettings,
    };
  }

  doSynthesizeSpeechStandard(text: string, options?: FunctionOptions) {
    return this.callAPI(text, options);
  }

  async doSynthesizeSpeechStreamDuplex(
    textStream: AsyncIterable<string>
    // options?: FunctionOptions | undefined
  ): Promise<AsyncIterable<Delta<Buffer>>> {
    const responseSchema = z.union([
      z.object({
        audio: z.string(),
        isFinal: z.literal(false).nullable(),
        normalizedAlignment: z
          .object({
            chars: z.array(z.string()),
            charStartTimesMs: z.array(z.number()),
            charDurationsMs: z.array(z.number()),
          })
          .nullable(),
      }),
      z.object({
        isFinal: z.literal(true),
      }),
      z.object({
        message: z.string(),
        error: z.string(),
        code: z.number(),
      }),
    ]);

    const queue = new AsyncQueue<Delta<Buffer>>();

    const model = this.settings.model ?? defaultModel;
    const socket = await createSimpleWebSocket(
      `wss://api.elevenlabs.io/v1/text-to-speech/${this.settings.voice}/stream-input?model_id=${model}`
    );

    socket.onopen = async () => {
      const api = this.settings.api ?? new ElevenLabsApiConfiguration();

      // send begin-of-stream (BOS) message:
      socket.send(
        JSON.stringify({
          // The JS WebSocket API does not support authorization headers, so we send the API key in the BOS message.
          // See https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
          xi_api_key: api.apiKey,
          text: " ",
          voice_settings: toApiVoiceSettings(this.settings.voiceSettings),
        })
      );

      // send text in chunks:
      let textBuffer = "";
      for await (const textDelta of textStream) {
        textBuffer += textDelta;

        // using ". " as separator: sending in full sentences improves the quality
        // of the audio output significantly.
        const separator = textBuffer.lastIndexOf(". ");

        if (separator === -1) {
          continue;
        }

        const textToProcess = textBuffer.slice(0, separator);
        textBuffer = textBuffer.slice(separator + 1);

        socket.send(
          JSON.stringify({
            text: textToProcess,
            try_trigger_generation: true,
          })
        );
      }

      // send remaining text:
      if (textBuffer.length > 0) {
        socket.send(
          JSON.stringify({
            text: `${textBuffer} `, // append space
            try_trigger_generation: true,
          })
        );
      }

      // send end-of-stream (EOS) message:
      socket.send(JSON.stringify({ text: "" }));
    };

    socket.onmessage = (event) => {
      const parseResult = responseSchema.safeParse(JSON.parse(event.data)); // TODO Secure JSON

      if (!parseResult.success) {
        console.log(JSON.parse(event.data));
        queue.push({ type: "error", error: parseResult.error });
        return;
      }

      const response = parseResult.data;

      if ("error" in response) {
        queue.push({ type: "error", error: response });
        return;
      }

      if (!response.isFinal) {
        queue.push({
          type: "delta",
          fullDelta: event,
          valueDelta: Buffer.from(response.audio, "base64"),
        });
      }
    };

    socket.onerror = (error) => {
      queue.push({ type: "error", error });
    };

    socket.onclose = () => {
      queue.close();
    };

    return queue;
  }

  withSettings(
    additionalSettings: Partial<ElevenLabsSpeechSynthesisModelSettings>
  ) {
    return new ElevenLabsSpeechSynthesisModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

async function callElevenLabsTextToSpeechAPI({
  api = new ElevenLabsApiConfiguration(),
  abortSignal,
  text,
  voiceId,
  modelId,
  voiceSettings,
}: {
  api?: ApiConfiguration;
  abortSignal?: AbortSignal;
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: ElevenLabsSpeechSynthesisModelSettings["voiceSettings"];
}): Promise<Buffer> {
  return postJsonToApi({
    url: api.assembleUrl(`/text-to-speech/${voiceId}`),
    headers: api.headers,
    body: {
      text,
      model_id: modelId ?? defaultModel,
      voice_settings: toApiVoiceSettings(voiceSettings),
    },
    failedResponseHandler: failedElevenLabsCallResponseHandler,
    successfulResponseHandler: createAudioMpegResponseHandler(),
    abortSignal,
  });
}

function toApiVoiceSettings(
  voiceSettings?: ElevenLabsSpeechSynthesisModelSettings["voiceSettings"]
) {
  return voiceSettings != null
    ? {
        stability: voiceSettings.stability,
        similarity_boost: voiceSettings.similarityBoost,
        style: voiceSettings.style,
        use_speaker_boost: voiceSettings.useSpeakerBoost,
      }
    : undefined;
}
