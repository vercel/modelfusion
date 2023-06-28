import { IdMetadata } from "../run/IdMetadata.js";
import { ModelInformation } from "../run/ModelInformation.js";
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

export type ModelCallObserver = {
  onModelCallStarted?: (event: ModelCallStartedEvent) => void;
  onModelCallFinished?: (event: ModelCallFinishedEvent) => void;
};

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
