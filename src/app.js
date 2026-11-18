import express from "express";
import { routeurAuth } from "./routes/auth.js";
import { routeurTaches } from "./routes/taches.js";

export const app = express();

app.use(express.json());

app.get("/sante", (req, res) => {
  res.json({ statut: "ok", pid: process.pid, uptime: Math.round(process.uptime()) });
});

app.use("/api/auth", routeurAuth);
app.use("/api/taches", routeurTaches);

app.use((req, res) => {
  res.status(404).json({ erreur: "Route introuvable" });
});

// Express 5 transmet ici les erreurs des handlers async
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ erreur: "Erreur interne du serveur" });
});
