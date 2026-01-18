import { run, get, all } from "../db.js";
import { generateId } from "../utils.js";

export async function listMessages(req, res) {
  try {
    const rows = await all(
      "SELECT id, texte, auteur, type, date FROM forum_messages ORDER BY date ASC"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function createMessage(req, res) {
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
}

export async function updateMessage(req, res) {
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
}

export async function deleteMessage(req, res) {
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
}
