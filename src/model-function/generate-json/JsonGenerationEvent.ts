import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface JsonGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "json-generation" | "json-or-text-generation";
}

export type JsonGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "json-generation" | "json-or-text-generation";
};
