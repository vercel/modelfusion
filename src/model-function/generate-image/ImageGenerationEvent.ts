import {
  BaseModelCallFinishedEvent,
  BaseModelCallStartedEvent,
} from "../ModelCallEvent.js";

export interface ImageGenerationStartedEvent extends BaseModelCallStartedEvent {
  functionType: "image-generation";
  prompt: unknown;
}

export type ImageGenerationFinishedEvent = BaseModelCallFinishedEvent & {
  functionType: "image-generation";
  prompt: unknown;
} & (
    | {
        status: "success";
        response: unknown;
        generatedImage: string;
      }
    | { status: "error"; error: unknown }
    | { status: "abort" }
  );
