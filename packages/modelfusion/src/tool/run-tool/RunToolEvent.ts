import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent";

export interface runToolStartedEvent extends BaseFunctionStartedEvent {
  functionType: "run-tool";
}

export interface runToolFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "run-tool";
}
