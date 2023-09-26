import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface StructureStreamingStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "structure-streaming";
}

export interface StructureStreamingFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "structure-streaming";
}
