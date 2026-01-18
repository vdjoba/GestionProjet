import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import forumRouter from "./routes/forum.js";
import eventsRouter from "./routes/events.js";
import healthRouter from "./routes/health.js";
import { initDb } from "./db.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/forum", forumRouter);
app.use("/api/events", eventsRouter);
app.use("/api/health", healthRouter);

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

export default app;
