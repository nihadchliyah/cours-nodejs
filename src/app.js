import express from "express";
import { routeurTaches } from "./routes/taches.js";

export const app = express();

app.use(express.json());
app.use("/api/taches", routeurTaches);

app.use((req, res) => {
  res.status(404).json({ erreur: "Route introuvable" });
});

// Express 5 transmet ici les erreurs des handlers async
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erreur: "Erreur interne du serveur" });
});
