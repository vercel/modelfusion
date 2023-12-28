import {
  ExtensionFunctionFinishedEvent,
  ExtensionFunctionStartedEvent,
} from "modelfusion/extension";

export interface GuardStartedEvent extends ExtensionFunctionStartedEvent {
  extension: "guard";
}

export interface GuardFinishedEvent extends ExtensionFunctionFinishedEvent {
  extension: "guard";
}
