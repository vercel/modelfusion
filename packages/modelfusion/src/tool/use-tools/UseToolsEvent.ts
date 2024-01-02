import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent.js";

export interface useToolsStartedEvent extends BaseFunctionStartedEvent {
  functionType: "use-tools";
}

export interface useToolsFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "use-tools";
}
