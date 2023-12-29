"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathJsTool = void 0;
const mathjs = __importStar(require("mathjs"));
const modelfusion_1 = require("modelfusion");
const zod_1 = require("zod");
const DEFAULT_DESCRIPTION = "A tool for evaluating mathematical expressions. Example expressions: " +
    "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.";
/**
 * A tool for evaluating mathematical expressions.
 *
 * @see https://mathjs.org/
 */
class MathJsTool extends modelfusion_1.Tool {
    constructor(settings) {
        super({
            name: settings.name,
            description: settings.description ?? DEFAULT_DESCRIPTION,
            parameters: (0, modelfusion_1.zodSchema)(zod_1.z.object({
                expression: zod_1.z.string(),
            })),
            execute: async ({ expression }) => mathjs.evaluate(expression),
        });
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.settings = settings;
    }
}
exports.MathJsTool = MathJsTool;
