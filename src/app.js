import express from "express";
import { routeurAuth } from "./routes/auth.js";

export const app = express();

app.use(express.json());

app.get("/sante", (req, res) => res.json({ statut: "ok" }));
app.use("/api/auth", routeurAuth);

app.use((req, res) => {
  res.status(404).json({ erreur: "Route introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ erreur: "Erreur interne du serveur" });
});
