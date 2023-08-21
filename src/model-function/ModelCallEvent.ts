import {
  RunFunctionFinishedEventMetadata,
  RunFunctionStartedEventMetadata,
} from "../run/RunFunctionEvent.js";
import { ModelInformation } from "./ModelInformation.js";
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
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./transcribe-speech/TranscriptionEvent.js";

export type ModelCallStartedEventMetadata = RunFunctionStartedEventMetadata & {
  model: ModelInformation;
};

export type ModelCallStartedEvent =
  | ImageGenerationStartedEvent
  | JsonGenerationStartedEvent
  | TextEmbeddingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEventMetadata =
  RunFunctionFinishedEventMetadata & {
    model: ModelInformation;
  };

export type ModelCallFinishedEvent =
  | ImageGenerationFinishedEvent
  | JsonGenerationFinishedEvent
  | TextEmbeddingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | TranscriptionFinishedEvent;
