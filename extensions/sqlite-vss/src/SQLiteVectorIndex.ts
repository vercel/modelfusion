import { Schema, Vector, VectorIndex } from "modelfusion";
import * as sqlite_vss from "sqlite-vss";
import Database from "better-sqlite3";

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
    sqlite_vss.loadVector(db);
    sqlite_vss.loadVss(db);

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
        insertData.run(item.id, dataString, vectorString);
        insertVss.run(item.id, vectorString);
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
    let query = `WITH matches AS (
            SELECT rowid, distance FROM vss_vectors WHERE vss_search(vector, ?) ${
              maxDistance !== undefined ? `AND distance <= ${maxDistance}` : ""
            } ${maxResults ? "LIMIT " + maxResults : ""}
        ) SELECT vectors.id, vectors.data, matches.distance FROM matches LEFT JOIN vectors ON vectors.id = matches.rowid`;

    const stmt = this.db.prepare(query);
    const result = stmt.all(JSON.stringify(queryVector));

    return result.map((row: any) => {
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
