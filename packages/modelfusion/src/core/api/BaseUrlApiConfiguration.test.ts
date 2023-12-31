import { BaseUrlApiConfiguration } from "./BaseUrlApiConfiguration.js";

describe("with text URLs", () => {
  it("should assemble the correct url", async () => {
    const api = new BaseUrlApiConfiguration({
      baseUrl: "http://localhost:8080",
    });

    expect(api.assembleUrl("/test")).toBe("http://localhost:8080/test");
  });
});
