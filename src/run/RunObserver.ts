import { ImageGenerationObserver } from "../image/generate/ImageGenerationObserver.js";
import { TextGenerationObserver } from "../text/generate/TextGenerationObserver.js";

export interface RunObserver
  extends TextGenerationObserver,
    ImageGenerationObserver {}
