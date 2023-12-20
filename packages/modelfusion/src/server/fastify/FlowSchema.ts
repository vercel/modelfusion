import { z } from "zod";

export interface FlowSchema<INPUT, EVENT> {
  input: z.ZodType<INPUT>;
  events: z.ZodType<EVENT>;
}
