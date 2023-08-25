import dotenv from "dotenv";
import {
  DefaultRun,
  FunctionFinishedEvent,
  FunctionObserver,
  FunctionStartedEvent,
  OpenAITextGenerationModel,
  generateText,
  setGlobalFunctionObservers,
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

  // Example 1: Set a global funtion observer
  setGlobalFunctionObservers([observer]);
  const text1 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot name Evo:\n\n"
  );
  setGlobalFunctionObservers([]);

  // Example 2: Set the observer on the model
  const text2 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
      observers: [observer],
    }),
    "Write a short story about a robot name Bud:\n\n"
  );

  // Example 3: Set the observer on the run
  const run = new DefaultRun({
    observers: [observer],
  });
  const text3 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Pam:\n\n",
    { run }
  );

  // Example 4: Set the observer on the function call
  const text4 = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot named Nox:\n\n",
    { observers: [observer] }
  );
})();
