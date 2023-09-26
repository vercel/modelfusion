import { expect, test, describe } from "vitest";
import { fixJson } from "./fixJson";

describe("fixJson", () => {
  test("should handle empty input", () => {
    expect(fixJson("")).toBe("");
  });

  describe("null", () => {
    test("should handle incomplete null", () => {
      expect(fixJson("nul")).toBe("null");
    });
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

    test("should handle negative numbers", () => {
      expect(fixJson("-12")).toBe("-12");
    });

    test("should handle incomplete negative numbers", () => {
      expect(fixJson("-")).toBe("");
    });

    test("should handle e-notation numbers", () => {
      expect(fixJson("2.5e")).toBe("2.5");
      expect(fixJson("2.5e-")).toBe("2.5");
      expect(fixJson("2.5e3")).toBe("2.5e3");
      expect(fixJson("-2.5e3")).toBe("-2.5e3");
    });

    test("should handle uppercase e-notation numbers", () => {
      expect(fixJson("2.5E")).toBe("2.5");
      expect(fixJson("2.5E-")).toBe("2.5");
      expect(fixJson("2.5E3")).toBe("2.5E3");
      expect(fixJson("-2.5E3")).toBe("-2.5E3");
    });
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

  describe("nesting", () => {
    test("should handle nested arrays with numbers", () => {
      expect(fixJson("[1, [2, 3, [")).toBe("[1, [2, 3, []]]");
    });

    test("should handle nested arrays with literals", () => {
      expect(fixJson("[false, [true, [")).toBe("[false, [true, []]]");
    });

    test("should handle nested objects", () => {
      expect(fixJson('{"key": {"subKey":')).toBe('{"key": {}}');
    });

    test("should handle nested objects with numbers", () => {
      expect(fixJson('{"key": 123, "key2": {"subKey":')).toBe(
        '{"key": 123, "key2": {}}'
      );
    });

    test("should handle nested objects with literals", () => {
      expect(fixJson('{"key": null, "key2": {"subKey":')).toBe(
        '{"key": null, "key2": {}}'
      );
    });

    test("should handle arrays within objects", () => {
      expect(fixJson('{"key": [1, 2, {')).toBe('{"key": [1, 2, {}]}');
    });

    test("should handle objects within arrays", () => {
      expect(fixJson('[1, 2, {"key": "value",')).toBe(
        '[1, 2, {"key": "value"}]'
      );
    });

    test("should handle nested arrays and objects", () => {
      expect(fixJson('{"a": {"b": ["c", {"d": "e",')).toBe(
        '{"a": {"b": ["c", {"d": "e"}]}}'
      );
    });

    test("should handle deeply nested structures", () => {
      expect(fixJson('{"a": {"b": {"c": {"d":')).toBe(
        '{"a": {"b": {"c": {}}}}'
      );
    });
  });
});
