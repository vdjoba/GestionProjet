import { run, get } from "../db.js";
import { generateId } from "../utils.js";

export async function registerUser(req, res) {
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
}

export async function loginUser(req, res) {
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
}

export async function resetPassword(req, res) {
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
}
