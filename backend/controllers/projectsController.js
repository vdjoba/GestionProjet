import { run, get, all } from "../db.js";
import { generateId } from "../utils.js";

export async function createProject(req, res) {
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
}

export async function listProjects(req, res) {
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
}

export async function latestProjects(req, res) {
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
}
