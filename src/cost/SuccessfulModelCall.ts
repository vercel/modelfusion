import { ModelCallFinishedEvent } from "../model/ModelCallObserver.js";

export type SuccessfulModelCall = ModelCallFinishedEvent & {
  status: "success";
};
