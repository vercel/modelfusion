import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";
import { ModelInformation } from "./ModelInformation.js";
import {
  ImageDescriptionFinishedEvent,
  ImageDescriptionStartedEvent,
} from "./describe-image/ImageDescriptionEvent.js";
import {
  TextEmbeddingFinishedEvent,
  TextEmbeddingStartedEvent,
} from "./embed-text/TextEmbeddingEvent.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./generate-image/ImageGenerationEvent.js";
import {
  JsonGenerationFinishedEvent,
  JsonGenerationStartedEvent,
} from "./generate-json/JsonGenerationEvent.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "./generate-text/TextGenerationEvent.js";
import {
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./generate-text/TextStreamingEvent.js";
import {
  SpeechSynthesisFinishedEvent,
  SpeechSynthesisStartedEvent,
} from "./synthesize-speech/SpeechSynthesisEvent.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./transcribe-speech/TranscriptionEvent.js";

export interface BaseModelCallStartedEvent extends BaseFunctionStartedEvent {
  model: ModelInformation;

  /**
   * The main input to the model call. The type depends on the call type or model.
   */
  input: unknown;

  /**
   * The model settings used for the call. The type depends on the model.
   */
  settings: unknown;
}

export type BaseModelCallFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: unknown;

      /**
       * Optional usage information for the model call. The type depends on the call type.
       */
      usage?: unknown;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface BaseModelCallFinishedEvent extends BaseFunctionFinishedEvent {
  model: ModelInformation;

  /**
   * The main input to the model call. The type depends on the call type or model.
   */
  input: unknown;

  /**
   * The model settings used for the call. The type depends on the model.
   */
  settings: unknown;

  /**
   * The result of the model call. Can be "success", "error", or "abort". Additional information is provided depending on the status.
   */
  result: BaseModelCallFinishedEventResult;
}

export type ModelCallStartedEvent =
  | ImageDescriptionStartedEvent
  | ImageGenerationStartedEvent
  | JsonGenerationStartedEvent
  | SpeechSynthesisStartedEvent
  | TextEmbeddingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEvent =
  | ImageDescriptionFinishedEvent
  | ImageGenerationFinishedEvent
  | JsonGenerationFinishedEvent
  | SpeechSynthesisFinishedEvent
  | TextEmbeddingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | TranscriptionFinishedEvent;
