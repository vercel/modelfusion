import { convertJsonSchemaToGBNF } from "./convertJsonSchemaToGBNF.js";

describe("primitives", () => {
  it("should convert string", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "string",
      })
    ).toMatchSnapshot();
  });

  it("should convert number", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "number",
      })
    ).toMatchSnapshot();
  });

  it("should convert integer", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "integer",
      })
    ).toMatchSnapshot();
  });

  it("should convert boolean", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "boolean",
      })
    ).toMatchSnapshot();
  });

  it("should convert null", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "null",
      })
    ).toMatchSnapshot();
  });
});

describe("array", () => {
  it("should convert array of string", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "array",
        items: {
          type: "string",
        },
      })
    ).toMatchSnapshot();
  });

  it("should convert array of array of string", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "array",
        items: {
          type: "array",
          items: {
            type: "string",
          },
        },
      })
    ).toMatchSnapshot();
  });

  it("should convert array of object", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            age: {
              type: "number",
            },
          },
        },
      })
    ).toMatchSnapshot();
  });
});

describe("object", () => {
  it("should convert object", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
      })
    ).toMatchSnapshot();
  });

  it("should convert object with required properties", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
        required: ["name"],
      })
    ).toMatchSnapshot();
  });

  it("should convert object with additional properties", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
        additionalProperties: true,
      })
    ).toMatchSnapshot();
  });

  it("should convert object with additional properties of string", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
        additionalProperties: {
          type: "string",
        },
      })
    ).toMatchSnapshot();
  });

  it("should convert object with additional properties of object", () => {
    expect(
      convertJsonSchemaToGBNF({
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
        additionalProperties: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            age: {
              type: "number",
            },
          },
        },
      })
    ).toMatchSnapshot();
  });
});
