import { LlamaCppBindings } from "./binding.js";
import assert from "node:assert";

assert(LlamaCppBindings, "The expected module is undefined");
assert(LlamaCppBindings.getSystemInfo, "The expected method is undefined");

function testBasic() {
  const instance = new LlamaCppBindings("mr-yeoman");
  assert(instance.greet, "The expected method is not defined");
  assert.strictEqual(
    instance.greet("kermit"),
    "mr-yeoman",
    "Unexpected value returned"
  );
  assert(
    LlamaCppBindings.getSystemInfo().then((info) => info.length > 2),
    "System info is too short"
  );
}

assert.doesNotThrow(testBasic, "testBasic threw an exception");

console.log("Tests passed- everything looks OK!");
