import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { LlamaCppCompletionModel } from "./LlamaCppCompletionModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer("http://127.0.0.1:8080/completion");

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `data: {"content":"Hello","multimodal":false,"slot_id":0,"stop":false}\n\n`,
      `data: {"content":", ","multimodal":false,"slot_id":0,"stop":false}\n\n`,
      `data: {"content":"world!","multimodal":false,"slot_id":0,"stop":false}\n\n`,
      `data: {"content":"","generation_settings":{"frequency_penalty":0.0,"grammar":"",` +
        `"ignore_eos":false,"logit_bias":[],"min_p":0.05000000074505806,"mirostat":0,` +
        `"mirostat_eta":0.10000000149011612,"mirostat_tau":5.0,"model":"models/llama-2-7b-chat.Q4_K_M.gguf",` +
        `"n_ctx":4096,"n_keep":0,"n_predict":-1,"n_probs":0,"penalize_nl":true,"penalty_prompt_tokens":[],` +
        `"presence_penalty":0.0,"repeat_last_n":64,"repeat_penalty":1.100000023841858,"seed":4294967295,` +
        `"stop":[],"stream":true,"temperature":0.800000011920929,"tfs_z":1.0,"top_k":40,"top_p":0.949999988079071,` +
        `"typical_p":1.0,"use_penalty_prompt_tokens":false},"model":"models/llama-2-7b-chat.Q4_K_M.gguf",` +
        `"prompt":"hello","slot_id":0,"stop":true,"stopped_eos":true,"stopped_limit":false,` +
        `"stopped_word":false,"stopping_word":"","timings":{"predicted_ms":1054.704,"predicted_n":69,` +
        `"predicted_per_second":65.421198743913,"predicted_per_token_ms":15.285565217391303,` +
        `"prompt_ms":244.228,"prompt_n":5,"prompt_per_second":20.472673075978186,` +
        `"prompt_per_token_ms":48.845600000000005},"tokens_cached":74,"tokens_evaluated":5,` +
        `"tokens_predicted":69,"truncated":false}\n\n`,
    ];

    const stream = await streamText({
      model: new LlamaCppCompletionModel().withTextPrompt(),
      prompt: "hello",
    });

    // note: space moved to last chunk bc of trimming
    expect(await arrayFromAsync(stream)).toStrictEqual([
      "Hello",
      ",",
      " world!",
    ]);
  });
});
