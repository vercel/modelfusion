import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface TextStreamingStartedEvent extends BaseModelCallStartedEvent {
  functionType: "text-streaming";
}

export interface TextStreamingFinishedEvent extends BaseModelCallFinishedEvent {
  functionType: "text-streaming";
}
