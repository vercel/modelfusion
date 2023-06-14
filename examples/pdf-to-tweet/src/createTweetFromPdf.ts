import {
  TextEmbeddingObserver,
  MemoryStore,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  RunContext,
  TextGenerationObserver,
  VectorDB,
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
  run,
}: {
  topic: string;
  pdfPath: string;
  exampleTweetIndexPath: string;
  openAiApiKey: string;
  run: RunContext & TextGenerationObserver & TextEmbeddingObserver;
}) {
  const model = new OpenAIChatModel({
    apiKey: openAiApiKey,
    model: "gpt-4",
  });

  const exampleTweetStore = new VectorDB({
    store: await MemoryStore.deserialize({
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
        text: textFromPdf,
        model: model.withSettings({ temperature: 0 }),
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
        reservedCompletionTokens: 1024,
      },
      {
        functionId: "extract-information",
        run,
      }
    );

  // generate a draft tweet:
  const draftTweet = await model.generateText(
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
    {
      functionId: "draft-tweet",
      settings: { temperature: 0.5 },
      run,
    }
  );

  // search for similar tweets:
  const similarTweets = await exampleTweetStore.queryByText(
    {
      queryText: draftTweet,
      maxResults: 1,
      similarityThreshold: 0.5,
    },
    { run }
  );

  if (similarTweets.length === 0) {
    return draftTweet;
  }

  // rewrite the tweet:
  return await model.generateText(
    [
      OpenAIChatMessage.system(
        `## TASK\nRewrite the draft tweet on ${topic} using the style from the example tweet.`
      ),
      OpenAIChatMessage.user(`## DRAFT TWEET\n${draftTweet}`),
      OpenAIChatMessage.user(
        `## STYLE EXAMPLE\n${similarTweets[0].data.tweet}`
      ),
    ],
    {
      functionId: "rewrite-tweet",
      settings: { temperature: 0.5 },
      run,
    }
  );
}
