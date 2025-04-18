import sqlite from "better-sqlite3";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config({});

const db = new sqlite(process.env.DATABASE_URL);

// Enable foreign_keys, we need to do this every time the database is opened
db.pragma("foreign_keys = ON");

if (process.argv.length - 2 !== 2) {
  console.log(
    "ERROR: generateUsers requires 2 arguments: [username] [password]",
  );
  process.exit();
}

const username = process.argv[2];
const password = process.argv[3];

console.log("Hashing and salting password...");

const saltRounds = 10;

const addUserQuery = db.prepare(
  "INSERT INTO users (username, password) VALUES (?, ?)",
);

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Hashing error: ", err);
    process.exit(1);
  }

  addUserQuery.run(username, hash);

  console.log("Added user to the database.");
});
