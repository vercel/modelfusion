import {
  ExtensionFunctionFinishedEvent,
  ExtensionFunctionStartedEvent,
} from "modelfusion/internal";

export interface GuardStartedEvent extends ExtensionFunctionStartedEvent {
  extension: "guard";
}

export interface GuardFinishedEvent extends ExtensionFunctionFinishedEvent {
  extension: "guard";
}
