import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface ImageDescriptionStartedEvent
  extends BaseModelCallStartedEvent {
  functionType: "image-description";
}

export type ImageDescriptionFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      output: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface ImageDescriptionFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "image-description";
  result: ImageDescriptionFinishedEventResult;
}
