---
sidebar_position: 32
---

# Abort Signal

Model calls can be expensive and long running. In interactive user interfaces such as chatbots, users may want to cancel interactions. You can implement the backend of this and save costs by using the standard [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) API.

### Example

```ts
const abortController = new AbortController();

generateText(model, "Write a short story about a robot learning to love:\n\n", {
  run: { abortSignal: abortController.signal },
})
  .then(/* ... */)
  .catch((error) => {
    if (error instanceof AbortError) {
      console.log("the run was aborted");
    }
  });

abortController.abort(); // aborts the running generate text call
```
