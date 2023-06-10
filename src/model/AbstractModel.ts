import { RunContext } from "../run/RunContext.js";
import { ModelInformation } from "../run/ModelInformation.js";
import { Model, ModelSettings } from "./Model.js";
import { RunObserver } from "index.js";

export abstract class AbstractModel<SETTINGS extends ModelSettings>
  implements Model<SETTINGS>
{
  constructor({ settings }: { settings: SETTINGS }) {
    this.settings = settings;
  }

  abstract readonly provider: string;
  abstract readonly modelName: string | null;

  // implemented as a separate accessor to remove all other properties from the model
  get modelInformation(): ModelInformation {
    return {
      provider: this.provider,
      modelName: this.modelName,
    };
  }

  private get uncaughtErrorHandler() {
    return (
      this.settings.uncaughtErrorHandler ??
      ((error) => {
        console.error(error);
      })
    );
  }

  protected callEachObserver(
    run: RunContext | undefined,
    callObserver: (observer: RunObserver) => void
  ) {
    const observers = [
      ...(this.settings.observers ?? []),
      ...(run?.observers ?? []),
    ];

    observers.forEach((observer) => {
      try {
        callObserver(observer);
      } catch (error) {
        this.uncaughtErrorHandler(error);
      }
    });
  }

  readonly settings: SETTINGS;

  abstract withSettings(additionalSettings: Partial<SETTINGS>): this;
}
