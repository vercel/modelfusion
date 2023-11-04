import { Schema, Vector, VectorIndex } from "modelfusion";
import Database from "better-sqlite3";
import { join } from "node:path";
import { arch, platform } from "node:process";
import { statSync } from "node:fs";

const supportedPlatforms = [
  ["darwin", "x64"],
  ["darwin", "arm64"],
  ["linux", "x64"],
];

function validPlatform(platform: string, arch: string) {
  return (
    supportedPlatforms.find(([p, a]) => platform == p && arch === a) !== null
  );
}
function extensionSuffix(platform: string) {
  if (platform === "win32") return "dll";
  if (platform === "darwin") return "dylib";
  return "so";
}
function platformPackageName(platform: string, arch: string) {
  const os = platform === "win32" ? "windows" : platform;
  return `sqlite-vss-${os}-${arch}`;
}

function loadablePathResolver(name: string) {
  if (!validPlatform(platform, arch)) {
    throw new Error(
      `Unsupported platform for sqlite-vss, on a ${platform}-${arch} machine, but not in supported platforms (${supportedPlatforms
        .map(([p, a]) => `${p}-${a}`)
        .join(",")}). Consult the sqlite-vss NPM package README for details. `
    );
  }
  const packageName = platformPackageName(platform, arch);
  const loadablePath = join(
    __filename,
    "..",
    "..",
    "node_modules",
    packageName,
    "lib",
    `${name}.${extensionSuffix(platform)}`
  );
  console.log(loadablePath);
  if (!statSync(loadablePath, { throwIfNoEntry: false })) {
    throw new Error(
      `Loadble extension for sqlite-vss not found. Was the ${packageName} package installed? Avoid using the --no-optional flag, as the optional dependencies for sqlite-vss are required.`
    );
  }

  return loadablePath;
}

export function getVectorLoadablePath() {
  return loadablePathResolver("vector0");
}

export function getVssLoadablePath() {
  return loadablePathResolver("vss0");
}

export function loadVector(db: Database.Database) {
  db.loadExtension(getVectorLoadablePath());
}
export function loadVss(db: Database.Database) {
  db.loadExtension(getVssLoadablePath());
}
export function load(db: Database.Database) {
  loadVector(db);
  loadVss(db);
}

export class SQLiteVectorIndex<DATA extends object | undefined>
  implements VectorIndex<DATA, SQLiteVectorIndex<DATA>, null>
{
  readonly db: Database.Database;
  readonly schema: Schema<DATA>;

  constructor({
    filename,
    schema,
  }: {
    filename: string;
    schema: Schema<DATA>;
  }) {
    this.db = this.setupDatabase(filename);
    this.schema = schema;
  }

  private openDatabase(filename: string) {
    const db = new Database(filename, { fileMustExist: false });
    db.pragma("journal_mode = WAL");
    return db;
  }

  private setupDatabase(filename: string) {
    const db = this.openDatabase(filename);
    loadVector(db);
    loadVss(db);

    db.prepare("SELECT vss_version()").run();

    db.prepare(
      `CREATE TABLE IF NOT EXISTS vectors (id TEXT PRIMARY KEY, data TEXT, vector TEXT)`
    ).run();
    db.prepare(
      `CREATE VIRTUAL TABLE IF NOT EXISTS vss_vectors USING vss0(vector(1536))`
    ).run();

    console.log("Successfully created vectors and vss_vectors tables");
    return db;
  }

  async upsertMany(data: Array<{ id: string; vector: Vector; data: DATA }>) {
    const upsertData = this.db.transaction((items) => {
      const insertData = this.db.prepare(
        "INSERT OR REPLACE INTO vectors (id, data, vector) VALUES (?, ?, ?)"
      );
      const insertVss = this.db.prepare(
        "INSERT OR REPLACE INTO vss_vectors (rowid, vector) VALUES (?, ?)"
      );
      for (const item of items) {
        const dataString = JSON.stringify(item.data);
        const vectorString = JSON.stringify(item.vector);
        const res = insertData.run(item.id, dataString, vectorString);
        insertVss.run(res.lastInsertRowid, vectorString);
      }
    });

    upsertData(data);
  }

  async queryByVector({
    queryVector,
    similarityThreshold,
    maxResults,
  }: {
    queryVector: Vector;
    maxResults: number;
    similarityThreshold?: number;
  }): Promise<Array<{ id: string; data: DATA; similarity?: number }>> {
    const maxDistance = similarityThreshold
      ? 1 - similarityThreshold
      : undefined;
    const query = `WITH matches AS (
            SELECT rowid, distance FROM vss_vectors WHERE vss_search(vector, ?) ${
              maxDistance !== undefined ? `AND distance <= ${maxDistance}` : ""
            } ${maxResults ? "LIMIT " + maxResults : ""}
        ) SELECT vectors.id, vectors.data, matches.distance FROM matches LEFT JOIN vectors ON vectors.rowid = matches.rowid`;

    const stmt = this.db.prepare(query);

    const result = stmt.all(JSON.stringify(queryVector)) as {
      id: string;
      data: string;
      distance: number;
    }[];

    return result.map((row) => {
      const data = JSON.parse(row.data);
      const validationResult = this.schema.validate(data);

      if (!validationResult.success) {
        throw validationResult.error;
      }

      return {
        id: row.id,
        data: validationResult.value,
        similarity: 1 - row.distance,
      };
    });
  }

  asIndex(): SQLiteVectorIndex<DATA> {
    return this;
  }
}
