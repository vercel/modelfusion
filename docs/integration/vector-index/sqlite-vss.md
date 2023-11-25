---
sidebar_position: 10
title: SQLite VSS
---

# SQLite VSS Vector Index

[SQLite VSS](https://github.com/asg017/sqlite-vss) is a SQLite extension that provides vector similarity search (VSS) functionality based on Faiss.

:::info

Windows is currently not supported.

:::

## Setup

1. Install [SQLite](https://www.sqlite.org/index.html) if needed
   - on MacOS it is pre-installed
2. Install the ModelFusion SQLite VSS extension:
   ```sh
   npm install @modelfusion/sqlite-vss
   ```
3. Install the peer dependencies:
   ```sh
   npm install better-sqlite3 sqlite-vss
   ```
4. Install the library for your architecture:
   ```sh
   npm install sqlite-vss-darwin-x64
   npm install sqlite-vss-darwin-arm64
   npm install sqlite-vss-linux-x64
   ```

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

### Create a Vector Index

```ts
import {
  SQLiteVectorIndex,
  setupSQLiteDatabase,
} from "@modelfusion/sqlite-vss";
import { zodSchema } from "modelfusion";

// Initialize the SQLite database:
const database = setupSQLiteDatabase(new BetterSqlite3(":memory:"));

// Create a vector index:
const vectorIndex = new SQLiteVectorIndex({
  db: database,
  schema: zodSchema(zodSchema),
});
```

## Source Code

[@modelfusion/sqlite-vss](https://github.com/lgrammel/modelfusion/tree/main/extensions/sqlite-vss)
