---
sidebar_position: 1
---

# Getting Started

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Installation

```bash
npm install ai-utils.js
```

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above (for 'fetch' support)

## Usage Examples

### Tokenization

```ts
import { TikTokenTokenizer } from "ai-utils.js";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await tokenizer.countTokens(text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```
