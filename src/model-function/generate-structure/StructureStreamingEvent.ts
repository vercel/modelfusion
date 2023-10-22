import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface StructureStreamingStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "stream-structure";
}

export interface StructureStreamingFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "stream-structure";
}
