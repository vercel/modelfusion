import * as dotenv from "dotenv";
import { setGlobalFunctionLogging } from "modelfusion";
import { runEndpointServer } from "./runEndpointServer";
import { z } from "zod";

dotenv.config();

setGlobalFunctionLogging("basic-text");

runEndpointServer({
  port: +(process.env.PORT ?? "3001"),
  endpoint: {
    name: "answer",

    inputSchema: z.object({
      prompt: z.string(),
    }),

    eventSchema: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("start-llm"),
      }),
      z.object({
        type: z.literal("start-tts"),
      }),
      z.object({
        type: z.literal("tts-chunk"),
        base64Audio: z.string(),
      }),
      z.object({
        type: z.literal("finish-tts"),
      }),
    ]),

    async processRequest({ input, run }) {
      console.log(input);
      run.publishEvent({ type: "start-llm" });
    },
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
