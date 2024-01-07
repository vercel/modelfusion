/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Convert JSON Schema to a GBNF grammar.
 *
 * This is a modified version of
 * https://github.com/ggerganov/llama.cpp/blob/master/examples/server/public/json-schema-to-grammar.mjs
 */
export function convertJsonSchemaToGBNF(schema: unknown): string {
  const rules = new RuleMap();

  rules.add("space", SPACE_RULE);

  visit(schema, undefined, rules);

  return rules.toGBNF();
}
const SPACE_RULE = '" "?';

const PRIMITIVE_RULES = {
  boolean: '("true" | "false") space',
  number:
    '("-"? ([0-9] | [1-9] [0-9]*)) ("." [0-9]+)? ([eE] [-+]? [0-9]+)? space',
  integer: '("-"? ([0-9] | [1-9] [0-9]*)) space',
  string: ` "\\"" ( [^"\\\\] | "\\\\" (["\\\\/bfnrt] | "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]) )* "\\"" space`,
  null: '"null" space',
} as Record<string, string>;

class RuleMap {
  readonly rules = new Map<string, string>();

  add(name: string, rule: string): string {
    const escapedName = this.escapeRuleName(name, rule);
    this.rules.set(escapedName, rule);
    return escapedName;
  }

  /**
   * Replace invalid characters in rule name with hyphens.
   * Disambiguate the name if it already exists.
   */
  private escapeRuleName(name: string, rule: string) {
    const baseName = name.replace(/[^\dA-Za-z-]+/g, "-");

    if (!this.rules.has(baseName) || this.rules.get(baseName) === rule) {
      return baseName;
    }

    let i = 0;
    while (this.rules.has(`${baseName}${i}`)) {
      if (this.rules.get(`${baseName}${i}`) === rule) {
        return `${baseName}${i}`;
      }

      i++;
    }

    return `${baseName}${i}`;
  }

  toGBNF() {
    return Array.from(this.rules)
      .map(([name, rule]) => `${name} ::= ${rule}`)
      .join("\n");
  }
}

const GRAMMAR_LITERAL_ESCAPES = {
  "\r": "\\r",
  "\n": "\\n",
  '"': '\\"',
} as Record<string, string>;

function formatLiteral(literal: string) {
  const escaped = JSON.stringify(literal).replace(
    /[\n\r"]/g,
    (m) => GRAMMAR_LITERAL_ESCAPES[m]
  );

  return `"${escaped}"`;
}

function visit(schema: any, name: string | undefined, rules: RuleMap): string {
  const schemaType = schema.type;
  const ruleName = name || "root";

  if (schema.oneOf || schema.anyOf) {
    const rule = (schema.oneOf || schema.anyOf)
      .map((altSchema: any, i: number) =>
        visit(altSchema, `${name}${name ? "-" : ""}${i}`, rules)
      )
      .join(" | ");

    return rules.add(ruleName, rule);
  } else if ("const" in schema) {
    return rules.add(ruleName, formatLiteral(schema.const));
  } else if ("enum" in schema) {
    const rule = schema.enum.map(formatLiteral).join(" | ");
    return rules.add(ruleName, rule);
  } else if (schemaType === "object" && "properties" in schema) {
    const propPairs = Object.entries(schema.properties);

    let rule = '"{" space';
    propPairs.forEach(([propName, propSchema], i) => {
      const propRuleName = visit(
        propSchema,
        `${name ?? ""}${name ? "-" : ""}${propName}`,
        rules
      );
      if (i > 0) {
        rule += ' "," space';
      }
      rule += ` ${formatLiteral(propName)} space ":" space ${propRuleName}`;
    });
    rule += ' "}" space';

    return rules.add(ruleName, rule);
  } else if (schemaType === "array" && "items" in schema) {
    const itemRuleName = visit(
      schema.items,
      `${name ?? ""}${name ? "-" : ""}item`,
      rules
    );
    const rule = `"[" space (${itemRuleName} ("," space ${itemRuleName})*)? "]" space`;
    return rules.add(ruleName, rule);
  } else {
    if (!PRIMITIVE_RULES[schemaType]) {
      throw new Error(`Unrecognized schema: ${JSON.stringify(schema)}`);
    }
    return rules.add(
      ruleName === "root" ? "root" : schemaType,
      PRIMITIVE_RULES[schemaType]
    );
  }
}
