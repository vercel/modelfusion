import { ImageGenerationObserver } from "../model/image-generation/ImageGenerationObserver.js";
import { TextGenerationObserver } from "../model/text-generation/TextGenerationObserver.js";

export interface RunObserver
  extends TextGenerationObserver,
    ImageGenerationObserver {}
