import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent";

export interface ImageGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "generate-image";
}

export type ImageGenerationFinishedEventResult =
  | {
      status: "success";
      rawResponse: unknown;
      value: string;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

export interface ImageGenerationFinishedEvent
  extends BaseModelCallFinishedEvent {
  functionType: "generate-image";
  result: ImageGenerationFinishedEventResult;
}
