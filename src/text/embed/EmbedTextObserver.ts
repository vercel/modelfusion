import { EmbedTextEndEvent, EmbedTextStartEvent } from "./EmbedTextEvent.js";

export type EmbedTextObserver = {
  onEmbedTextStart?: (call: EmbedTextStartEvent) => void;
  onEmbedTextEnd?: (call: EmbedTextEndEvent) => void;
};
