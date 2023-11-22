import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAITextEmbeddingModel,
  VectorIndexRetriever,
  ZodSchema,
  generateText,
  openai,
  retrieve,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
} from "modelfusion";
import fs from "node:fs";
import { z } from "zod";
import { loadPdfAsText } from "./loadPdfAsText";

export async function createTweetFromPdf({
  topic,
  pdfPath,
  exampleTweetIndexPath,
}: {
  topic: string;
  pdfPath: string;
  exampleTweetIndexPath: string;
}) {
  const model = openai.ChatTextGenerator({ model: "gpt-4" });

  const textFromPdf = await loadPdfAsText(pdfPath);

  // extract information on topic from pdf:
  const informationOnTopic =
    await summarizeRecursivelyWithTextGenerationAndTokenSplitting(
      {
        text: textFromPdf,
        model: model.withSettings({
          temperature: 0,
          maxCompletionTokens: 1024,
        }),
        prompt: async ({ text }: { text: string }) => [
          OpenAIChatMessage.user(`## TOPIC\n${topic}`),
          OpenAIChatMessage.system(
            [
              `## ROLE`,
              `You are an expert at extracting information.`,
              `You need to extract and keep all the information on the topic above topic from the text below.`,
              `Only include information that is directly relevant for the topic.`,
            ].join("\n")
          ),
          OpenAIChatMessage.user(`## TEXT\n${text}`),
        ],
      },
      { functionId: "extract-information" }
    );

  // generate a draft tweet:
  const draftTweet = await generateText(
    model.withSettings({ temperature: 0.5 }),
    [
      OpenAIChatMessage.user(`## TOPIC\n${topic}`),
      OpenAIChatMessage.system(
        [
          `## TASK`,
          `Rewrite the content below into coherent tweet on the topic above.`,
          `Include all relevant information about the topic.`,
          `Discard all irrelevant information.`,
        ].join("\n")
      ),
      OpenAIChatMessage.user(`## CONTENT\n${informationOnTopic}`),
    ],
    { functionId: "draft-tweet" }
  );

  // search for similar tweets:
  const similarTweets = await retrieve(
    new VectorIndexRetriever({
      vectorIndex: await MemoryVectorIndex.deserialize({
        serializedData: fs.readFileSync(exampleTweetIndexPath, "utf-8"),
        schema: new ZodSchema(z.string()),
      }),
      embeddingModel: new OpenAITextEmbeddingModel({
        model: "text-embedding-ada-002",
      }),
      maxResults: 1,
      similarityThreshold: 0.5,
    }),
    draftTweet,
    { functionId: "embed-draft-tweet" }
  );

  if (similarTweets.length === 0) {
    return draftTweet;
  }

  // rewrite the tweet:
  return await generateText(
    model.withSettings({ temperature: 0.5 }),
    [
      OpenAIChatMessage.system(
        `## TASK\nRewrite the draft tweet on ${topic} using the style from the example tweet.`
      ),
      OpenAIChatMessage.user(`## DRAFT TWEET\n${draftTweet}`),
      OpenAIChatMessage.user(`## STYLE EXAMPLE\n${similarTweets[0]}`),
    ],
    { functionId: "rewrite-tweet" }
  );
}
