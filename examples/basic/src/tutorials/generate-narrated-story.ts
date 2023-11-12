import dotenv from "dotenv";
import {
  ElevenLabsSpeechModel,
  OpenAIChatModel,
  generateSpeech,
  generateText,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const story = await generateText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withInstructionPrompt(),
    {
      system:
        "You are a great storyteller. " +
        "You specialize in stories for children.",
      instruction: "Tell me a story about a robot learning to love.",
    }
  );

  const narratedStory = await generateSpeech(
    new ElevenLabsSpeechModel({
      voice: "AZnzlk1XvdvUeBnXmlld", // Domi
      model: "eleven_multilingual_v2",
    }),
    story
  );

  const path = `./generate-narrated-story-example.mp3`;
  fs.writeFileSync(path, narratedStory);
}

main().catch(console.error);
