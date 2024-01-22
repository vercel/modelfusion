const llamacppBindings = require("../dist/binding.js");
const assert = require("assert");

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

assert.doesNotThrow(testBasic, undefined, "testBasic threw an expection");
assert.throws(testInvalidParams, undefined, "testInvalidParams didn't throw");

console.log("Tests passed- everything looks OK!");