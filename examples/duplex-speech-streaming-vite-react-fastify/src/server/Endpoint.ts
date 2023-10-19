import { z } from "zod";
import { EndpointRun } from "./EndpointRun";

export type Endpoint<INPUT, EVENT> = {
  name: string;

  inputSchema: z.ZodType<INPUT>;

  eventSchema: z.ZodType<EVENT>;

  processRequest: (options: {
    input: INPUT;
    run: EndpointRun<EVENT>;
  }) => Promise<void>;
};
