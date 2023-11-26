import { ModelInformation } from "./ModelInformation.js";
import { Model, ModelSettings } from "./Model.js";

export abstract class AbstractModel<SETTINGS extends ModelSettings>
  implements Model<SETTINGS>
{
  readonly settings: SETTINGS;

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

  abstract get settingsForEvent(): Partial<SETTINGS>;

  abstract withSettings(additionalSettings: Partial<SETTINGS>): this;
}
