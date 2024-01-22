const llamacppBindings = require("../dist/binding.js");
import * as assert from "assert";

assert(llamacppBindings, "The expected module is undefined");
assert(llamacppBindings.getSystemInfo, "The expected method is undefined");

function testBasic()
{
    const instance = new llamacppBindings("mr-yeoman");
    assert(instance.greet, "The expected method is not defined");
    assert.strictEqual(instance.greet("kermit"), "mr-yeoman", "Unexpected value returned");
    assert(llamacppBindings.getSystemInfo().length > 2, "System info is too short");
}

function testInvalidParams()
{
    const instance = new llamacppBindings();
}

assert.doesNotThrow(testBasic, "testBasic threw an expection");
assert.throws(testInvalidParams, "testInvalidParams didn't throw");

console.log("Tests passed- everything looks OK!");