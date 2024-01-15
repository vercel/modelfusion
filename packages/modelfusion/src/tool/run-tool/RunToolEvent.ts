import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../../core/FunctionEvent.js";

export interface runToolStartedEvent extends BaseFunctionStartedEvent {
  functionType: "run-tool";
}

export interface runToolFinishedEvent extends BaseFunctionFinishedEvent {
  functionType: "run-tool";
}
