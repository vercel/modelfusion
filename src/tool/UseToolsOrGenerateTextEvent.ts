import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";

export interface UseToolsOrGenerateTextStartedEvent
  extends BaseFunctionStartedEvent {
  functionType: "use-tools-or-generate-text";
}

export interface UseToolsOrGenerateTextFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "use-tools-or-generate-text";
}
