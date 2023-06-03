import { Vector } from "../../run/Vector.js";
import { RunFunction } from "../../run/RunFunction.js";

export type TextsEmbeddingFunction = RunFunction<Array<string>, Array<Vector>>;
export type TextEmbeddingFunction = RunFunction<string, Vector>;
