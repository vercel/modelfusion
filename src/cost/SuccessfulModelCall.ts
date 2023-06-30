import { ModelInformation } from "../model/ModelInformation.js";

export type SuccessfulModelCall = {
  type:
    | "image-generation"
    | "text-generation"
    | "text-embedding"
    | "transcription";
  model: ModelInformation;
  settings: unknown;
  response: unknown;
};
