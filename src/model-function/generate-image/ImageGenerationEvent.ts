import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface ImageGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "image-generation";
}

export type ImageGenerationFinishedEventResult =
  | {
      status: "success";
      response: unknown;
      value: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface ImageGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "image-generation";
  result: ImageGenerationFinishedEventResult;
}
