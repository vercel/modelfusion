import { IdMetadata } from "../run/IdMetadata.js";
import { ModelInformation } from "./ModelInformation.js";
import {
  TextEmbeddingFinishedEvent,
  TextEmbeddingStartedEvent,
} from "./embed-text/TextEmbeddingEvent.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "./generate-text/TextGenerationEvent.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./image-generation/ImageGenerationEvent.js";
import {
  JsonGenerationFinishedEvent,
  JsonGenerationStartedEvent,
} from "./json-generation/JsonGenerationEvent.js";
import {
  TextStreamingFinishedEvent,
  TextStreamingStartedEvent,
} from "./stream-text/TextStreamingEvent.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./transcribe-audio/TranscriptionEvent.js";

export type ModelCallEvent = ModelCallStartedEvent | ModelCallFinishedEvent;

export type ModelCallStartedEventMetadata = IdMetadata & {
  model: ModelInformation;
  startEpochSeconds: number;
};

export type ModelCallStartedEvent =
  | ImageGenerationStartedEvent
  | JsonGenerationStartedEvent
  | TextEmbeddingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEventMetadata = ModelCallStartedEventMetadata & {
  durationInMs: number;
};

export type ModelCallFinishedEvent =
  | ImageGenerationFinishedEvent
  | JsonGenerationFinishedEvent
  | TextEmbeddingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | TranscriptionFinishedEvent;
