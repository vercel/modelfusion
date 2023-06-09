import {
  GenerateTextEndEvent,
  GenerateTextStartEvent,
} from "../text/generate/GenerateTextEvent.js";
import { RunObserver } from "./RunObserver.js";

export class ConsoleObserver implements RunObserver {
  onGenerateTextStart(event: GenerateTextStartEvent) {
    console.log(JSON.stringify(event, null, 2));
  }

  onGenerateTextEnd(event: GenerateTextEndEvent) {
    console.log(JSON.stringify(event, null, 2));
  }
}
