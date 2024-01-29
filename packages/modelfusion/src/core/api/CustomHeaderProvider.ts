import { HeaderParameters } from "./ApiConfiguration";

export type CustomHeaderProvider = (
  headerParameters: HeaderParameters
) => Record<string, string | undefined>;
