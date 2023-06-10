import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "../model/image-generation/ImageGenerationObserver.js";
import {
  TextEmbeddingFinishedEvent,
  TextEmbeddingStartedEvent,
} from "../model/text-embedding/TextEmbeddingObserver.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "../model/text-generation/TextGenerationObserver.js";
import { RunObserver } from "./RunObserver.js";

export class ConsoleObserver implements RunObserver {
  onImageGenerationStarted(event: ImageGenerationStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onImageGenerationFinished(event: ImageGenerationFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onTextGenerationStarted(event: TextGenerationStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onTextGenerationFinished(event: TextGenerationFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onTextEmbeddingStarted(event: TextEmbeddingStartedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onTextEmbeddingFinished(event: TextEmbeddingFinishedEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
