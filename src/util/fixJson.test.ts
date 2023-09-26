import { expect, test, describe } from "vitest";
import { fixJson } from "./fixJson";

describe("fixJson", () => {
  test("should handle empty input", () => {
    expect(fixJson("")).toBe("");
  });

  describe("boolean", () => {
    test("should handle incomplete true", () => {
      expect(fixJson("t")).toBe("true");
    });

    test("should handle incomplete false", () => {
      expect(fixJson("fals")).toBe("false");
    });
  });

  describe("number", () => {
    test("should handle incomplete numbers", () => {
      expect(fixJson("12.")).toBe("12");
    });

    test("should handle numbers with dot", () => {
      expect(fixJson("12.2")).toBe("12.2");
    });

    // TODO e-notation
  });

  describe("string", () => {
    test("should handle incomplete strings", () => {
      expect(fixJson('"abc')).toBe('"abc"');
    });

    test("should handle escape sequences", () => {
      expect(fixJson('"value with \\"quoted\\" text and \\\\ escape')).toBe(
        '"value with \\"quoted\\" text and \\\\ escape"'
      );
    });

    test("should handle incomplete escape sequences", () => {
      expect(fixJson('"value with \\')).toBe('"value with "');
    });

    test("should handle unicode characters", () => {
      expect(fixJson('"value with unicode \u003C"')).toBe(
        '"value with unicode \u003C"'
      );
    });
  });

  describe("array", () => {
    test("should handle incomplete array", () => {
      expect(fixJson("[")).toBe("[]");
    });

    test("should handle trailing comma", () => {
      expect(fixJson("[1, ")).toBe("[1]");
    });
  });

  describe("object", () => {
    test("should handle keys without values", () => {
      expect(fixJson('{"key":')).toBe("{}");
    });

    test("should handle partial keys (first key)", () => {
      expect(fixJson('{"ke')).toBe("{}");
    });

    test("should handle partial keys (second key)", () => {
      expect(fixJson('{"k1": 1, "k2')).toBe('{"k1": 1}');
    });

    test("should handle partial keys with colon (second key)", () => {
      expect(fixJson('{"k1": 1, "k2":')).toBe('{"k1": 1}');
    });

    test("should handle trailing whitespaces", () => {
      expect(fixJson('{"key": "value"  ')).toBe('{"key": "value"}');
    });
  });

  test("should handle nested arrays and objects", () => {
    expect(fixJson('{"a": {"b": ["c", {"d": "e",')).toBe(
      '{"a": {"b": ["c", {"d": "e"}]}}'
    );
  });

  test("should handle deeply nested structures", () => {
    expect(fixJson('{"a": {"b": {"c": {"d":')).toBe('{"a": {"b": {"c": {}}}}');
  });
});
