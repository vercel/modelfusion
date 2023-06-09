import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "./GenerateTextEvent.js";

export interface GenerateTextObserver {
  onGenerateTextStart?: (event: GenerateTextStartEvent) => void;
  onGenerateTextEnd?: (event: GenerateTextEndEvent) => void;
}
