import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import {
  createAudioMpegResponseHandler,
  createTextErrorResponseHandler,
  postJsonToApi,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { safeParseJSON } from "../../core/schema/parseJSON.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import { Delta } from "../../model-function/Delta.js";
import {
  SpeechGenerationModelSettings,
  StreamingSpeechGenerationModel,
} from "../../model-function/generate-speech/SpeechGenerationModel.js";
import { AsyncQueue } from "../../util/AsyncQueue.js";
import { createSimpleWebSocket } from "../../util/SimpleWebSocket.js";
import { ElevenLabsApiConfiguration } from "./ElevenLabsApiConfiguration.js";

const elevenLabsModels = [
  "eleven_multilingual_v2",
  "eleven_multilingual_v1",
  "eleven_monolingual_v1",
  "eleven_turbo_v2",
] as const;

const defaultModel = "eleven_monolingual_v1";

export interface ElevenLabsSpeechModelSettings
  extends SpeechGenerationModelSettings {
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

  optimizeStreamingLatency?: 0 | 1 | 2 | 3 | 4;
  outputFormat?:
    | "mp3_44100"
    | "pcm_16000"
    | "pcm_22050"
    | "pcm_24000"
    | "pcm_44100";

  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };

  generationConfig?: {
    chunkLengthSchedule: number[];
  };
}

/**
 * Synthesize speech using the ElevenLabs Text to Speech API.
 *
 * Both regular text-to-speech and full duplex text-to-speech streaming are supported.
 *
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech-websockets
 */
export class ElevenLabsSpeechModel
  extends AbstractModel<ElevenLabsSpeechModelSettings>
  implements StreamingSpeechGenerationModel<ElevenLabsSpeechModelSettings>
{
  constructor(settings: ElevenLabsSpeechModelSettings) {
    super({ settings });
  }

  readonly provider = "elevenlabs";

  get modelName() {
    return this.settings.voice;
  }

  private async callAPI(
    text: string,
    callOptions: FunctionCallOptions
  ): Promise<Buffer> {
    const api = this.settings.api ?? new ElevenLabsApiConfiguration();
    const abortSignal = callOptions?.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () =>
        postJsonToApi({
          url: api.assembleUrl(
            `/text-to-speech/${this.settings.voice}${assembleQuery({
              optimize_streaming_latency:
                this.settings.optimizeStreamingLatency,
              output_format: this.settings.outputFormat,
            })}`
          ),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            text,
            model_id: this.settings.model ?? defaultModel,
            voice_settings: toApiVoiceSettings(this.settings.voiceSettings),
          },
          failedResponseHandler: createTextErrorResponseHandler(),
          successfulResponseHandler: createAudioMpegResponseHandler(),
          abortSignal,
        }),
    });
  }

  get settingsForEvent(): Partial<ElevenLabsSpeechModelSettings> {
    return {
      model: this.settings.model,
      voice: this.settings.voice,
      voiceSettings: this.settings.voiceSettings,
    };
  }

  doGenerateSpeechStandard(text: string, options: FunctionCallOptions) {
    return this.callAPI(text, options);
  }

  async doGenerateSpeechStreamDuplex(
    textStream: AsyncIterable<string>
    // options?: FunctionOptions | undefined
  ): Promise<AsyncIterable<Delta<Buffer>>> {
    const queue = new AsyncQueue<Delta<Buffer>>();

    const model = this.settings.model ?? defaultModel;
    const socket = await createSimpleWebSocket(
      `wss://api.elevenlabs.io/v1/text-to-speech/${
        this.settings.voice
      }/stream-input${assembleQuery({
        model_id: model,
        optimize_streaming_latency: this.settings.optimizeStreamingLatency,
        output_format: this.settings.outputFormat,
      })}`
    );

    socket.onopen = async () => {
      const api = this.settings.api ?? new ElevenLabsApiConfiguration();

      // send begin-of-stream (BOS) message:
      socket.send(
        JSON.stringify({
          // The JS WebSocket API does not support authorization headers, so we send the API key in the BOS message.
          // See https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
          xi_api_key: api.apiKey,
          text: " ", // first message
          voice_settings: toApiVoiceSettings(this.settings.voiceSettings),
          generation_config: toGenerationConfig(this.settings.generationConfig),
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
      const parseResult = safeParseJSON({
        text: event.data,
        schema: zodSchema(streamingResponseSchema),
      });

      if (!parseResult.success) {
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
          deltaValue: Buffer.from(response.audio, "base64"),
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

  withSettings(additionalSettings: Partial<ElevenLabsSpeechModelSettings>) {
    return new ElevenLabsSpeechModel({
      ...this.settings,
      ...additionalSettings,
    }) as this;
  }
}

const streamingResponseSchema = z.union([
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

function assembleQuery(parameters: Record<string, unknown | undefined>) {
  let query = "";
  let hasQuestionMark = false;

  for (const [key, value] of Object.entries(parameters)) {
    if (value == null) {
      continue;
    }

    if (!hasQuestionMark) {
      query += "?";
      hasQuestionMark = true;
    } else {
      query += "&";
    }

    query += `${key}=${value}`;
  }

  return query;
}

function toApiVoiceSettings(
  voiceSettings?: ElevenLabsSpeechModelSettings["voiceSettings"]
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

function toGenerationConfig(
  generationConfig?: ElevenLabsSpeechModelSettings["generationConfig"]
) {
  return generationConfig != null
    ? { chunk_length_schedule: generationConfig.chunkLengthSchedule }
    : undefined;
}
