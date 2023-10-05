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
  EmbeddingFinishedEvent,
  EmbeddingStartedEvent,
} from "./embed/EmbeddingEvent.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./generate-image/ImageGenerationEvent.js";
import {
  StructureGenerationFinishedEvent,
  StructureGenerationStartedEvent,
} from "./generate-structure/StructureGenerationEvent.js";
import {
  StructureStreamingFinishedEvent,
  StructureStreamingStartedEvent,
} from "./generate-structure/StructureStreamingEvent.js";
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
      value: unknown;

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
  | EmbeddingStartedEvent
  | ImageDescriptionStartedEvent
  | ImageGenerationStartedEvent
  | StructureGenerationStartedEvent
  | StructureStreamingStartedEvent
  | SpeechSynthesisStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEvent =
  | EmbeddingFinishedEvent
  | ImageDescriptionFinishedEvent
  | ImageGenerationFinishedEvent
  | StructureGenerationFinishedEvent
  | StructureStreamingFinishedEvent
  | SpeechSynthesisFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | TranscriptionFinishedEvent;
