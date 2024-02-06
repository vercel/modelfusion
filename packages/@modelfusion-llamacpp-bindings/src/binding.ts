// Import the native addon
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const addon = require("../build/Release/llamacpp-bindings-native.node");

// Correct the spelling in the interface name
export interface ILlamaCppBindingsNative {
  greet(strName: string): string;
}

export interface ILlamaCppBindingsNativeConstructor {
  new (name: string): ILlamaCppBindingsNative;
  getSystemInfo(): Promise<string>;
}

export class LlamaCppBindings implements ILlamaCppBindingsNative {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _addonInstance: ILlamaCppBindingsNative;

  constructor(name: string) {
    // Use the static _addon member to create a new instance
    this._addonInstance = new addon.llamacppBindings(name);
  }

  greet(strName: string) {
    return this._addonInstance.greet(strName);
  }

  // static members
  static async getSystemInfo(): Promise<string> {
    return addon.systemInfo();
  }
}
