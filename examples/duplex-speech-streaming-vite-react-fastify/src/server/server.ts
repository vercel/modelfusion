import * as dotenv from "dotenv";
import { setGlobalFunctionLogging } from "modelfusion";
import { runEndpointServer } from "./runEndpointServer";
import { z } from "zod";
import { eventSchema } from "../endpoint/eventSchema";

dotenv.config();

setGlobalFunctionLogging("basic-text");

runEndpointServer({
  port: +(process.env.PORT ?? "3001"),
  endpoint: {
    name: "answer",

    inputSchema: z.object({
      prompt: z.string(),
    }),

    eventSchema: eventSchema,

    async processRequest({ input, run }) {
      console.log(input);
      run.publishEvent({ type: "start-llm" });

      run.publishEvent({ type: "start-tts" });

      run.publishEvent({ type: "tts-chunk", base64Audio: "base64Audio" });

      run.publishEvent({ type: "finish-tts" });
    },
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
