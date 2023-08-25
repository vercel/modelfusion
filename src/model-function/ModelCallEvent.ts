import {
  FunctionFinishedEventMetadata,
  FunctionStartedEventMetadata,
} from "../run/FunctionEvent.js";
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
  SpeechSynthesisFinishedEvent,
  SpeechSynthesisStartedEvent,
} from "./synthesize-speech/SpeechSynthesisEvent.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./transcribe-speech/TranscriptionEvent.js";

export type ModelCallStartedEventMetadata = FunctionStartedEventMetadata & {
  model: ModelInformation;
};

export type ModelCallStartedEvent =
  | ImageGenerationStartedEvent
  | JsonGenerationStartedEvent
  | SpeechSynthesisStartedEvent
  | TextEmbeddingStartedEvent
  | TextGenerationStartedEvent
  | TextStreamingStartedEvent
  | TranscriptionStartedEvent;

export type ModelCallFinishedEventMetadata = FunctionFinishedEventMetadata & {
  model: ModelInformation;
};

export type ModelCallFinishedEvent =
  | ImageGenerationFinishedEvent
  | JsonGenerationFinishedEvent
  | SpeechSynthesisFinishedEvent
  | TextEmbeddingFinishedEvent
  | TextGenerationFinishedEvent
  | TextStreamingFinishedEvent
  | TranscriptionFinishedEvent;
