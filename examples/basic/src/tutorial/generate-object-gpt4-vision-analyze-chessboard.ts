import dotenv from "dotenv";
import {
  jsonObjectPrompt,
  llamacpp,
  streamObject,
  zodSchema,
} from "modelfusion";
import fs from "node:fs";
import { z } from "zod";

dotenv.config();

async function main() {
  const chessboard = fs.readFileSync("data/chess.png");

  const objectStream = await streamObject({
    model: llamacpp
      .CompletionTextGenerator({
        promptTemplate: llamacpp.prompt.BakLLaVA1,
        maxGenerationTokens: 1024,
        temperature: 0,
      })
      .asObjectGenerationModel(jsonObjectPrompt.instruction()),

    schema: zodSchema(
      z.object({
        analysis: z.string().describe("analysis of the current board"),
        bestMove: z.object({
          rationale: z.string().describe("rationale for the move"),
          move: z.string().describe("move in algebraic notation"),
        }),
      })
    ),

    prompt: {
      system:
        "You analyze chess boards. " +
        "Provide a thorough analysis of the current board and the best move for the current player.",

      instruction: [
        { type: "text", text: "Current player: black" },
        { type: "image", image: chessboard },
      ],
    },
  });

  for await (const { partialObject } of objectStream) {
    console.clear();
    console.log(partialObject);
  }
}

main().catch(console.error);
