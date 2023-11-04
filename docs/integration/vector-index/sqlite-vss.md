---
sidebar_position: 2
title: SQLite VSS
---

# SQLite VSS Vector Index

## Setup

You need to install the ModelFusion SQLite VSS extension:

```bash
npm install @modelfusion/sqlite-vss
```

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/vector-index/)

### Create a Vector Index

```ts
import {
  SQLiteVectorIndex,
  setupSQLiteDatabase,
} from "@modelfusion/sqlite-vss";
import { ZodSchema } from "modelfusion";

// Initialize the SQLite database:
const db = setupSQLiteDatabase(dbPath);

// assuming zod schema for data and an embedding model are defined:
const vectorIndex = new SQLiteVectorIndex({
  db,
  schema: new ZodSchema(zodSchema),
});
```
