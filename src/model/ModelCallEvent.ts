import { IdMetadata } from "../run/IdMetadata.js";
import { ModelInformation } from "./ModelInformation.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./image-generation/ImageGenerationEvent.js";
import {
  TextEmbeddingFinishedEvent,
  TextEmbeddingStartedEvent,
} from "./text-embedding/TextEmbeddingEvent.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "./text-generation/TextGenerationEvent.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./transcription/TranscriptionEvent.js";

export type ModelCallEvent = ModelCallStartedEvent | ModelCallFinishedEvent;

export type ModelCallStartedEventMetadata = IdMetadata & {
  model: ModelInformation;
  startEpochSeconds: number;
};

export type ModelCallStartedEvent =
  | ImageGenerationStartedEvent
  | TextEmbeddingStartedEvent
  | TextGenerationStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEventMetadata = ModelCallStartedEventMetadata & {
  durationInMs: number;
};

export type ModelCallFinishedEvent =
  | ImageGenerationFinishedEvent
  | TextEmbeddingFinishedEvent
  | TextGenerationFinishedEvent
  | TranscriptionFinishedEvent;
