import { Command } from "commander";
import dotenv from "dotenv";
import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  TextChunk,
  VectorIndexSimilarTextChunkRetriever,
  generateText,
  retrieveTextChunks,
  splitRecursivelyAtCharacter,
  streamText,
  throttleMaxConcurrency,
  upsertTextChunks,
} from "modelfusion";
import * as readline from "node:readline/promises";
import { loadPdfAsText } from "./loadPdfAsText";

dotenv.config();

const program = new Command();

program
  .description("Chat with a PDF file")
  .requiredOption("-f, --file <value>", "Path to PDF file")
  .parse(process.argv);

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { file }: { file: string } = program.opts();

(async () => {
  // TODO this omits the page numbers
  console.log("Loading PDF...");
  const text = await loadPdfAsText(file);

  // TODO would be nice to have richer chunks
  const chunks = await splitRecursivelyAtCharacter({
    maxChunkSize: 256 * 4,
    text,
  });

  const vectorIndex = new MemoryVectorIndex<TextChunk>();
  const embeddingModel = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
    throttle: throttleMaxConcurrency({
      maxConcurrentCalls: 5,
    }),
  });

  // load chunks into vector index:
  console.log("Indexing content...");
  await upsertTextChunks({
    vectorIndex,
    embeddingModel,
    // TODO ideally the chunks are already TextChunks
    chunks: chunks.map((chunk) => ({ content: chunk })),
  });

  console.log();

  // chat loop:
  while (true) {
    const question = await chat.question("You: ");

    // hypothetical document embeddings:
    const { text: hypotheticalAnswer } = await generateText(
      new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
      [
        OpenAIChatMessage.system(`Answer the user's question.`),
        OpenAIChatMessage.user(question),
      ]
    );

    // search for text chunks that are similar to the hypothetical answer:
    const { chunks: information } = await retrieveTextChunks(
      new VectorIndexSimilarTextChunkRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.75,
      }),
      hypotheticalAnswer
    );

    // answer the user's question using the information:
    const { textStream } = await streamText(
      new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
      [
        OpenAIChatMessage.system(
          [
            // Instruct the model on how to answer:
            `Answer the user's question using only the provided information.`,
            // To reduce hallucination, it is important to give the model an answer
            // that it can use when the information is not sufficient:
            `If the user's question cannot be answered using the provided information, ` +
              `respond with "I don't know".`,
          ].join("\n")
        ),
        OpenAIChatMessage.user(`## QUESTION\n${question}`),
        OpenAIChatMessage.user(
          `## INFORMATION\n${JSON.stringify(information)}`
        ),
      ]
    );

    let fullResponse = "";
    process.stdout.write("\nAI : ");
    for await (const textFragment of textStream) {
      fullResponse += textFragment;
      process.stdout.write(textFragment);
    }
    process.stdout.write("\n\n");
  }
})();
