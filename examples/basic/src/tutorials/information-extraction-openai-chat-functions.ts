import dotenv from "dotenv";
import { ZodSchema, generateStructure, openai } from "modelfusion";
import fs from "node:fs";
import { z } from "zod";

dotenv.config();

async function main() {
  const extractNameAndPopulation = async (text: string) =>
    generateStructure(
      openai
        .ChatTextGenerator({
          model: "gpt-4",
          temperature: 0, // remove randomness as much as possible
          maxCompletionTokens: 200, // only a few tokens needed for the response
        })
        .asFunctionCallStructureGenerationModel({
          fnName: "storeCity",
          fnDescription: "Save information about the city",
        })
        .withInstructionPrompt(),

      new ZodSchema(
        z.object({
          city: z
            .object({
              name: z.string().describe("name of the city"),
              population: z.number().describe("population of the city"),
            })
            .nullable() // structure supports escape hatch
            .describe("information about the city"),
        })
      ),

      {
        system: [
          "Extract the name and the population of the city.",
          // escape hatch to limit extractions to city information:
          "The text might not be about a city.",
          "If it is not, set city to null.",
        ].join("\n"),
        instruction: text,
      }
    );

  const sanFranciscoWikipedia = JSON.parse(
    fs.readFileSync("data/san-francisco-wikipedia.json", "utf8")
  ).content;

  const extractedInformation1 = await extractNameAndPopulation(
    sanFranciscoWikipedia.slice(0, 2000)
  );

  console.log(extractedInformation1);

  const extractedInformation2 = await extractNameAndPopulation(
    "Carl was a friendly robot."
  );

  console.log(extractedInformation2);
}

main().catch(console.error);
