import {
  EmbedTextObserver,
  GenerateTextObserver,
  InMemoryStore,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  RunContext,
  VectorDB,
  generateText,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
} from "ai-utils.js";
import fs from "node:fs";
import z from "zod";
import { loadPdfAsText } from "./loadPdfAsText";

export async function createTweetFromPdf({
  topic,
  pdfPath,
  exampleTweetIndexPath,
  openAiApiKey,
  context,
}: {
  topic: string;
  pdfPath: string;
  exampleTweetIndexPath: string;
  openAiApiKey: string;
  context: RunContext & GenerateTextObserver & EmbedTextObserver;
}) {
  const textModel = new OpenAIChatModel({
    apiKey: openAiApiKey,
    model: "gpt-4",
  });

  const exampleTweetStore = new VectorDB({
    store: await InMemoryStore.deserialize({
      serializedData: fs.readFileSync(exampleTweetIndexPath, "utf-8"),
      schema: z.object({ tweet: z.string() }),
    }),
    embeddingModel: new OpenAITextEmbeddingModel({
      apiKey: openAiApiKey,
      model: "text-embedding-ada-002",
    }),
    queryFunctionId: "embed-draft-tweet",
  });

  const textFromPdf = await loadPdfAsText(pdfPath);

  // extract information on topic from pdf:
  const informationOnTopic =
    await summarizeRecursivelyWithTextGenerationAndTokenSplitting(
      {
        functionId: "extract-information-on-topic",
        text: textFromPdf,
        model: textModel.withSettings({ temperature: 0 }),
        prompt: async ({ text }: { text: string }) => [
          {
            role: "user" as const,
            content: `## TOPIC\n${topic}`,
          },
          {
            role: "system" as const,
            content: `## ROLE
You are an expert at extracting information.
You need to extract and keep all the information on the topic above topic from the text below.
Only include information that is directly relevant for the topic.`,
          },
          {
            role: "user" as const,
            content: `## TEXT\n${text}`,
          },
        ],
        reservedCompletionTokens: 1024,
      },
      context
    );

  // generate a draft tweet:
  const draftTweet = await generateText(
    {
      functionId: "generate-draft-tweet",
      model: textModel.withSettings({ temperature: 0.5 }),
      input: { content: informationOnTopic, topic },
      prompt: async ({ content, topic }) => [
        {
          role: "user" as const,
          content: `## TOPIC\n${topic}`,
        },
        {
          role: "system" as const,
          content: `## TASK
Rewrite the content below into coherent tweet on the topic above.
Include all relevant information about the topic.
Discard all irrelevant information.`,
        },
        {
          role: "user" as const,
          content: `## CONTENT\n${content}`,
        },
      ],
    },
    context
  );

  // search for similar tweets:
  const similarTweets = await exampleTweetStore.queryByText(
    {
      queryText: draftTweet,
      maxResults: 1,
      similarityThreshold: 0.5,
    },
    context
  );

  if (similarTweets.length === 0) {
    return draftTweet;
  }

  // rewrite the tweet:
  return await generateText(
    {
      functionId: "rewrite-tweet",
      model: textModel.withSettings({ temperature: 0.5 }),
      input: { draftTweet, topic, exampleTweet: similarTweets[0].data.tweet },
      prompt: async ({ draftTweet, topic, exampleTweet }) => [
        {
          role: "system" as const,
          content: `## TASK
Rewrite the draft tweet on ${topic} using the style from the example tweet.`,
        },
        {
          role: "user" as const,
          content: `## DRAFT TWEET\n${draftTweet}`,
        },
        {
          role: "user" as const,
          content: `## STYLE EXAMPLE\n${exampleTweet}`,
        },
      ],
    },
    context
  );
}
