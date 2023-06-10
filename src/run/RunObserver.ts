import { ImageGenerationObserver } from "../model/image-generation/ImageGenerationObserver.js";
import { TextEmbeddingObserver } from "../model/text-embedding/TextEmbeddingObserver.js";
import { TextGenerationObserver } from "../model/text-generation/TextGenerationObserver.js";

export interface RunObserver
  extends ImageGenerationObserver,
    TextEmbeddingObserver,
    TextGenerationObserver {}
