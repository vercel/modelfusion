// eslint-disable-next-line @typescript-eslint/no-var-requires
const addon = require("../build/Release/llamacpp-bindings-native");

interface IllamacppBindingsNative {
  greet(strName: string): string;
}

class llamacppBindings {
  constructor(name: string) {
    this._addonInstance = new addon.llamacppBindings(name);
  }

  greet(strName: string) {
    return this._addonInstance.greet(strName);
  }

  // private members
  private _addonInstance: IllamacppBindingsNative;

  // static members
  static getSystemInfo(): string {
    return addon.systemInfo();
  }
}

export = llamacppBindings;
