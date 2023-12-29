import { chat, instruction, text } from "./Llama2PromptTemplate.js";

describe("text prompt", () => {
  it("should format prompt", () => {
    const prompt = text().format("prompt");

    expect(prompt).toMatchSnapshot();
  });
});

describe("instruction prompt", () => {
  it("should format prompt with instruction", () => {
    const prompt = instruction().format({
      instruction: "instruction",
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with system and instruction", () => {
    const prompt = instruction().format({
      system: "system",
      instruction: "instruction",
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with instruction and response prefix", () => {
    const prompt = instruction().format({
      instruction: "instruction",
      responsePrefix: "response prefix",
    });

    expect(prompt).toMatchSnapshot();
  });
});

describe("chat prompt", () => {
  it("should format prompt with user message", () => {
    const prompt = chat().format({
      messages: [{ role: "user", content: "user message" }],
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with user-assistant-user messages", () => {
    const prompt = chat().format({
      messages: [
        { role: "user", content: "1st user message" },
        { role: "assistant", content: "assistant message" },
        { role: "user", content: "2nd user message" },
      ],
    });

    expect(prompt).toMatchSnapshot();
  });

  it("should format prompt with system message and user-assistant-user messages", () => {
    const prompt = chat().format({
      system: "you are a chatbot",
      messages: [
        { role: "user", content: "1st user message" },
        { role: "assistant", content: "assistant message" },
        { role: "user", content: "2nd user message" },
      ],
    });

    expect(prompt).toMatchSnapshot();
  });
});
