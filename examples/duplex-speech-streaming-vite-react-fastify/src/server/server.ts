import * as dotenv from "dotenv";
import {
  OpenAITextGenerationModel,
  setGlobalFunctionLogging,
  streamText,
} from "modelfusion";
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

      const textStream = await streamText(
        new OpenAITextGenerationModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 100,
        }),
        input.prompt
      );

      for await (const textFragment of textStream) {
        run.publishEvent({ type: "text-chunk", delta: textFragment });
      }

      run.publishEvent({ type: "start-tts" });

      run.publishEvent({ type: "tts-chunk", base64Audio: "base64Audio" });

      run.publishEvent({ type: "finish-tts" });
    },
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
