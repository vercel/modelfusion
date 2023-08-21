import dotenv from "dotenv";
import {
  ElevenLabsSpeechSynthesisModel,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateText,
  synthesizeSpeech,
} from "modelfusion";
import fs from "node:fs";

dotenv.config();

(async () => {
  const story = await generateText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    [
      OpenAIChatMessage.system(
        "You are a great storyteller. " +
          "You specialize in stories for children."
      ),
      OpenAIChatMessage.user("Tell me a story about a robot learning to love."),
    ]
  );

  const narratedStory = await synthesizeSpeech(
    new ElevenLabsSpeechSynthesisModel({
      voice: "AZnzlk1XvdvUeBnXmlld", // Domi
    }),
    story
  );

  const path = `./generate-narrated-story-example.mp3`;
  fs.writeFileSync(path, narratedStory);
})();
