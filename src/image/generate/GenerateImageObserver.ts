import {
  GenerateImageEndEvent,
  GenerateImageStartEvent,
} from "./GenerateImageEvent.js";

export type GenerateImageObserver = {
  onGenerateImageStart?: (event: GenerateImageStartEvent) => void;
  onGenerateImageEnd?: (event: GenerateImageEndEvent) => void;
};
