import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent";
import {
  ToolCallGenerationFinishedEvent,
  ToolCallGenerationStartedEvent,
} from "../tool/generate-tool-call/ToolCallGenerationEvent";
import {
  ToolCallsGenerationFinishedEvent,
  ToolCallsGenerationStartedEvent,
} from "../tool/generate-tool-calls/ToolCallsGenerationEvent";
import { ModelInformation } from "./ModelInformation";
import {
  ClassifyFinishedEvent,
  ClassifyStartedEvent,
} from "./classify/ClassifyEvent";
import {
  EmbeddingFinishedEvent,
  EmbeddingStartedEvent,
} from "./embed/EmbeddingEvent";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./generate-image/ImageGenerationEvent";
import {
  SpeechGenerationFinishedEvent,
  SpeechGenerationStartedEvent,
  SpeechStreamingFinishedEvent,
  SpeechStreamingStartedEvent,
} from "./generate-speech/SpeechGenerationEvent";
import {
  ObjectGenerationFinishedEvent,
  ObjectGenerationStartedEvent,
} from "./generate-object/ObjectGenerationEvent";
import {
  ObjectStreamingFinishedEvent,
  ObjectStreamingStartedEvent,
} from "./generate-object/ObjectStreamingEvent";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./generate-text/TextGenerationEvent";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./generate-transcription/TranscriptionEvent";

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

      /**
       * The original model response.
       */
      rawResponse: unknown;

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
  | ClassifyStartedEvent
  | EmbeddingStartedEvent
  | ImageGenerationStartedEvent
  | SpeechGenerationStartedEvent
  | SpeechStreamingStartedEvent
  | ObjectGenerationStartedEvent
  | ObjectStreamingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | ToolCallGenerationStartedEvent
  | ToolCallsGenerationStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEvent =
  | ClassifyFinishedEvent
  | EmbeddingFinishedEvent
  | ImageGenerationFinishedEvent
  | SpeechGenerationFinishedEvent
  | SpeechStreamingFinishedEvent
  | ObjectGenerationFinishedEvent
  | ObjectStreamingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | ToolCallGenerationFinishedEvent
  | ToolCallsGenerationFinishedEvent
  | TranscriptionFinishedEvent;
