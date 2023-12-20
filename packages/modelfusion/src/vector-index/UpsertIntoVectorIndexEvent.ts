import {
  BaseFunctionFinishedEvent,
  BaseFunctionStartedEvent,
} from "../core/FunctionEvent.js";

export interface UpsertIntoVectorIndexStartedEvent
  extends BaseFunctionStartedEvent {
  functionType: "upsert-into-vector-index";
  objects: unknown[];
}

export interface UpsertIntoVectorIndexFinishedEvent
  extends BaseFunctionFinishedEvent {
  functionType: "upsert-into-vector-index";
  objects: unknown[];
}
