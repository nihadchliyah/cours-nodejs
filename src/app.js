import express from "express";

export const app = express();

app.use(express.json());

app.use((req, res) => {
  res.status(404).json({ erreur: "Route introuvable" });
});

// Express 5 transmet ici les erreurs des handlers async
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erreur: "Erreur interne du serveur" });
});
