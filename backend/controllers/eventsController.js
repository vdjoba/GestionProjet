import { run, get, all } from "../db.js";
import { generateId } from "../utils.js";

export async function listEvents(req, res) {
  try {
    const rows = await all(
      "SELECT id, titre, date, lieu, description, created_at FROM events ORDER BY date ASC"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function createEvent(req, res) {
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
}

export async function updateEvent(req, res) {
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
}

export async function deleteEvent(req, res) {
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
}
