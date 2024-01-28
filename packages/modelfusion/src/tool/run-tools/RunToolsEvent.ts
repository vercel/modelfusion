import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent";

export interface runToolsStartedEvent extends BaseFunctionStartedEvent {
  functionType: "run-tools";
}

export interface runToolsFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "run-tools";
}
