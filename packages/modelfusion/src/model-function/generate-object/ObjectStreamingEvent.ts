import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent";

export interface ObjectStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "stream-object";
}

export interface ObjectStreamingFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "stream-object";
}
