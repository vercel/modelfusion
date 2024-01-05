import { HeaderParameters } from "./ApiConfiguration.js";

export type CustomHeaderProvider = (
  headerParameters: HeaderParameters
) => Record<string, string | undefined>;
