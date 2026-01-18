import sqlite3 from "sqlite3";

const DB_PATH = process.env.DB_PATH || "gestionprojet.db";
const db = new sqlite3.Database(DB_PATH);

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function initDb() {
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      nom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      matricule TEXT,
      filiere TEXT,
      mention TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      description TEXT NOT NULL,
      fichier TEXT,
      lien TEXT,
      filiere TEXT NOT NULL,
      auteur TEXT NOT NULL,
      date TEXT DEFAULT (datetime('now'))
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS forum_messages (
      id TEXT PRIMARY KEY,
      texte TEXT NOT NULL,
      auteur TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT DEFAULT (datetime('now'))
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      date TEXT NOT NULL,
      lieu TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  );
}
