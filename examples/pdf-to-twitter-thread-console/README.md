# PDF to Twitter Thread

Takes a PDF and a topic and creates a Twitter thread with all content from the PDF that is relevant to the topic.

## Usage

1. Create .env file with the following content:

```
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

2. Run the following commands:

```sh
npm install
npx ts-node src/main.ts -f my.pdf -t "my topic"
```
