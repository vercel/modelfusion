# PDF to Tweet

> _terminal app_, _PDF parsing_, _recursive information extraction_, _in memory vector indices_, _style example retrieval_, _OpenAI GPT-4_, _cost calculation_

Extracts information about a topic from a PDF and writes a tweet in your own style about it.

## Usage

1. Create .env file with the following content:

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

2. Create a file with example tweets that will serve as style templates. You can edit `data/example-tweet-index.json` or create your own file. The tweets should be separated by `\n-----\n`.

3. Run the following commands:

```sh
pnpm install
pnpm tsx src/indexTweets.ts -i data/example-tweets.txt -o data/example-tweet-index.json
pnpm tsx src/main.ts -f my.pdf -t "my topic" -e data/example-tweet-index.json
```
