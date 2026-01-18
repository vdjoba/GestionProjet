import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("gestionprojet.db");

function run(sql, params = []) {
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

function all(sql, params = []) {
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

function get(sql, params = []) {
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

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function initDb() {
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

app.post("/api/users/register", async (req, res) => {
  try {
    const { type, nom, email, password, matricule, filiere, mention } = req.body;
    if (!type || !nom || !email || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }
    const id = generateId("user");
    await run(
      `INSERT INTO users (id, type, nom, email, password, matricule, filiere, mention)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, type, nom, email, password, matricule || null, filiere || null, mention || null]
    );
    const user = await get(
      "SELECT id, type, nom, email, matricule, filiere, mention, created_at FROM users WHERE id = ?",
      [id]
    );
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    const user = await get(
      "SELECT id, type, nom, email, password, matricule, filiere, mention, created_at FROM users WHERE email = ?",
      [email]
    );
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/users/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email et nouveau mot de passe requis" });
    }
    const result = await run("UPDATE users SET password = ? WHERE email = ?", [
      newPassword,
      email
    ]);
    if (result.changes === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email" });
    }
    return res.json({ message: "Mot de passe réinitialisé" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const { titre, description, fichier, lien, filiere, auteur, date } = req.body;
    if (!titre || !description || !filiere || !auteur) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }
    const id = generateId("projet");
    const finalDate = date || new Date().toISOString();
    await run(
      `INSERT INTO projects (id, titre, description, fichier, lien, filiere, auteur, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, titre, description, fichier || null, lien || null, filiere, auteur, finalDate]
    );
    const projet = await get(
      "SELECT id, titre, description, fichier, lien, filiere, auteur, date FROM projects WHERE id = ?",
      [id]
    );
    return res.status(201).json(projet);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const { filiere, auteur } = req.query;
    const conditions = [];
    const values = [];
    if (filiere) {
      values.push(filiere);
      conditions.push("filiere = ?");
    }
    if (auteur) {
      values.push(auteur);
      conditions.push("auteur = ?");
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await all(
      `SELECT id, titre, description, fichier, lien, filiere, auteur, date FROM projects ${where} ORDER BY date DESC`,
      values
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/projects/latest", async (req, res) => {
  try {
    const { filieres } = req.query;
    if (!filieres) {
      return res.status(400).json({ message: "Paramètre filieres requis" });
    }
    const list = filieres.split(",");
    const map = {};
    list.forEach((f) => {
      map[f] = [];
    });
    for (const filiere of list) {
      const rows = await all(
        `SELECT id, titre, description, fichier, lien, filiere, auteur, date
         FROM projects
         WHERE filiere = ?
         ORDER BY date DESC
         LIMIT 5`,
        [filiere]
      );
      map[filiere] = rows;
    }
    return res.json(map);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/forum/messages", async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, texte, auteur, type, date FROM forum_messages ORDER BY date ASC"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/forum/messages", async (req, res) => {
  try {
    const { texte, auteur, type } = req.body;
    if (!texte || !auteur || !type) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }
    const id = generateId("msg");
    const now = new Date().toISOString();
    await run(
      `INSERT INTO forum_messages (id, texte, auteur, type, date)
       VALUES (?, ?, ?, ?, ?)`,
      [id, texte, auteur, type, now]
    );
    const msg = await get(
      "SELECT id, texte, auteur, type, date FROM forum_messages WHERE id = ?",
      [id]
    );
    return res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put("/api/forum/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { texte } = req.body;
    if (!texte) {
      return res.status(400).json({ message: "Texte requis" });
    }
    const result = await run("UPDATE forum_messages SET texte = ? WHERE id = ?", [texte, id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: "Message non trouvé" });
    }
    const msg = await get(
      "SELECT id, texte, auteur, type, date FROM forum_messages WHERE id = ?",
      [id]
    );
    return res.json(msg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.delete("/api/forum/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await get(
      "SELECT id, texte, auteur, type, date FROM forum_messages WHERE id = ?",
      [id]
    );
    if (!msg) {
      return res.status(404).json({ message: "Message non trouvé" });
    }
    await run("DELETE FROM forum_messages WHERE id = ?", [id]);
    return res.json(msg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, titre, date, lieu, description, created_at FROM events ORDER BY date ASC"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { titre, date, lieu, description } = req.body;
    if (!titre || !date || !lieu || !description) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }
    const id = generateId("event");
    await run(
      `INSERT INTO events (id, titre, date, lieu, description)
       VALUES (?, ?, ?, ?, ?)`,
      [id, titre, date, lieu, description]
    );
    const eventObj = await get(
      "SELECT id, titre, date, lieu, description, created_at FROM events WHERE id = ?",
      [id]
    );
    return res.status(201).json(eventObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, date, lieu, description } = req.body;
    if (!titre || !date || !lieu || !description) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }
    const result = await run(
      `UPDATE events
       SET titre = ?, date = ?, lieu = ?, description = ?
       WHERE id = ?`,
      [titre, date, lieu, description, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    const eventObj = await get(
      "SELECT id, titre, date, lieu, description, created_at FROM events WHERE id = ?",
      [id]
    );
    return res.json(eventObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventObj = await get(
      "SELECT id, titre, date, lieu, description, created_at FROM events WHERE id = ?",
      [id]
    );
    if (!eventObj) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    await run("DELETE FROM events WHERE id = ?", [id]);
    return res.json(eventObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await get("SELECT 1");
    return res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error" });
  }
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend GestionProjet démarré sur le port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Erreur d'initialisation de la base", err);
    process.exit(1);
  });
