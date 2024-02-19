# Basic Examples

Basic examples of how to the the functions in ModelFusion.

## Usage

1. Create .env file with the following content (and more settings, depending on the providers you want to use):

```sh
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
COHERE_API_KEY="YOUR_COHERE_API_KEY"
HUGGINGFACE_API_KEY="YOUR_HUGGINGFACE_API_KEY"
...
```

2. Run the following commands from the root directory of the modelfusion repo:

```sh
pnpm install
pnpm build
```

3. Run any example:

```sh
pnpm tsx examples/basic/src/path/to/example.ts
```
