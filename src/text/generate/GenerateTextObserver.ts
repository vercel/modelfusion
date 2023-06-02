import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "./GenerateTextEvent.js";

export type GenerateTextObserver = {
  onGenerateTextStart?: (event: GenerateTextStartEvent) => void;
  onGenerateTextEnd?: (event: GenerateTextEndEvent) => void;
};
