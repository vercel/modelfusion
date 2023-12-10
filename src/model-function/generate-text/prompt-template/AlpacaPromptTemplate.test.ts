import { instruction, text } from "./AlpacaPromptTemplate.js";

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
