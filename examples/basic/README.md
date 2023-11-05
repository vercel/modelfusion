# Basic Examples

Basic examples of how to the the functions in ModelFusion

## Usage

1. Create .env file with the following content (and more settings, depending on the providers you want to use):

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   COHERE_API_KEY="YOUR_COHERE_API_KEY"
   HUGGINGFACE_API_KEY="YOUR_HUGGINGFACE_API_KEY"
   ```

2. Setup:

   ```sh
   npm install
   ```

3. Run any example:
   ```sh
   npx tsx src/path/to/example.ts
   ```

## Development

You can link the packages that the examples depend on to the local source code (after calling `npm link` in the `dist` folder of the packages):

```sh
npm link modelfusion @modelfusion/serpapi-tools @modelfusion/google-custom-search-tool @modelfusion/pinecone @modelfusion/sqlite-vss
```
