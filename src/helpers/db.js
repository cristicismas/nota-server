import sqlite from "better-sqlite3";

import dotenv from "dotenv";

dotenv.config({});

// TODO: create indexes for better performance

const db = new sqlite(process.env.DATABASE_URL);

// Enable foreign_keys, we need to do this every time the database is opened
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export default db;
