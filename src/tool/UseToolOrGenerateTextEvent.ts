import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";

export interface UseToolOrGenerateTextStartedEvent
  extends BaseFunctionStartedEvent {
  functionType: "use-tool-or-generate-text";
}

export interface UseToolOrGenerateTextFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "use-tool-or-generate-text";
}
