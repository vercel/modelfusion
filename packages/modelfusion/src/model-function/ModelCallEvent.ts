import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";
import {
  ToolCallGenerationFinishedEvent,
  ToolCallGenerationStartedEvent,
} from "../tool/generate-tool-call/ToolCallGenerationEvent.js";
import {
  ToolCallsGenerationFinishedEvent,
  ToolCallsGenerationStartedEvent,
} from "../tool/generate-tool-calls/ToolCallsGenerationEvent.js";
import { ModelInformation } from "./ModelInformation.js";
import {
  EmbeddingFinishedEvent,
  EmbeddingStartedEvent,
} from "./embed/EmbeddingEvent.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./generate-image/ImageGenerationEvent.js";
import {
  SpeechGenerationFinishedEvent,
  SpeechGenerationStartedEvent,
  SpeechStreamingFinishedEvent,
  SpeechStreamingStartedEvent,
} from "./generate-speech/SpeechGenerationEvent.js";
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
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./generate-text/TextGenerationEvent.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./generate-transcription/TranscriptionEvent.js";

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
  | EmbeddingStartedEvent
  | ImageGenerationStartedEvent
  | SpeechGenerationStartedEvent
  | SpeechStreamingStartedEvent
  | StructureGenerationStartedEvent
  | StructureStreamingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | ToolCallGenerationStartedEvent
  | ToolCallsGenerationStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEvent =
  | EmbeddingFinishedEvent
  | ImageGenerationFinishedEvent
  | SpeechGenerationFinishedEvent
  | SpeechStreamingFinishedEvent
  | StructureGenerationFinishedEvent
  | StructureStreamingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | ToolCallGenerationFinishedEvent
  | ToolCallsGenerationFinishedEvent
  | TranscriptionFinishedEvent;
