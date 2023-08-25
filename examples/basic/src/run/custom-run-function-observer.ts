import dotenv from "dotenv";
import {
  DefaultRun,
  OpenAITextGenerationModel,
  FunctionFinishedEvent,
  FunctionStartedEvent,
  generateText,
  FunctionObserver,
} from "modelfusion";

dotenv.config();

(async () => {
  const observer: FunctionObserver = {
    onFunctionStarted(event: FunctionStartedEvent) {
      console.log(
        `Started ${event.type} (${event.metadata.callId}) at ${event.metadata.startEpochSeconds}`
      );
    },
    onFunctionFinished(event: FunctionFinishedEvent) {
      console.log(
        `Finished ${event.type} (${event.metadata.callId}) in ${event.metadata.durationInMs}ms`
      );
    },
  };

  // Example 1: Set the observer on the model
  const text1 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxCompletionTokens: 50,
      observers: [observer],
    }),
    "Write a short story about a robot name Buddy:\n\n"
  );

  // Example 2: Set the observer on the run
  const run = new DefaultRun({
    observers: [observer],
  });
  const text2 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Pam:\n\n",
    { run }
  );

  // Example 3: Set the observer on the function call
  const text3 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      temperature: 0.7,
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Nox:\n\n",
    { observers: [observer] }
  );
})();
