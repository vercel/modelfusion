import BetterSqlite3 from "better-sqlite3";
import { Schema, Vector, VectorIndex } from "modelfusion";
import * as sqliteVss from "sqlite-vss";

export function setupSQLiteDatabase(
  database: BetterSqlite3.Database
): BetterSqlite3.Database {
  sqliteVss.load(database);

  [
    `CREATE TABLE IF NOT EXISTS vectors (id TEXT PRIMARY KEY, data TEXT, vector TEXT)`,
    `CREATE VIRTUAL TABLE IF NOT EXISTS vss_vectors USING vss0(vector(1536))`,
  ].forEach((query) => database.prepare(query).run());

  return database;
}

export class SQLiteVectorIndex<DATA extends object | undefined>
  implements VectorIndex<DATA, SQLiteVectorIndex<DATA>, null>
{
  readonly db: BetterSqlite3.Database;
  readonly schema: Schema<DATA>;

  constructor({
    db,
    schema,
  }: {
    db: BetterSqlite3.Database;
    schema: Schema<DATA>;
  }) {
    this.db = db;
    this.schema = schema;
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
        const result = insertData.run(item.id, dataString, vectorString);
        insertVss.run(result.lastInsertRowid, vectorString);
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
            } ${maxResults ? `LIMIT ${maxResults}` : ""}
        ) SELECT vectors.id, vectors.data, matches.distance FROM matches LEFT JOIN vectors ON vectors.rowid = matches.rowid`;

    const statement = this.db.prepare(query);

    const result = statement.all(JSON.stringify(queryVector)) as {
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
        data: validationResult.data,
        similarity: 1 - row.distance,
      };
    });
  }

  asIndex(): SQLiteVectorIndex<DATA> {
    return this;
  }
}
