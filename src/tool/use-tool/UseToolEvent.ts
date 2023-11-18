import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent.js";

export interface UseToolStartedEvent extends BaseFunctionStartedEvent {
  functionType: "use-tool";
}

export interface UseToolFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "use-tool";
}
