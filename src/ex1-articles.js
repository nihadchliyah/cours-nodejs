// Exercice 1 — Trouver les bogues (version corrigée)
//
// Les quatre erreurs du fichier d'origine :
//  1. Le middleware de journalisation n'appelait pas next() : toute requête qui l'atteignait
//     restait sans réponse (le client attendait indéfiniment).
//  2. Il était déclaré APRÈS GET /api/articles : les lectures n'étaient jamais journalisées.
//     Les middlewares globaux se déclarent avant les routes.
//  3. POST répondait 200 : une création renvoie 201 Created.
//  4. Le gestionnaire d'erreurs n'avait que trois paramètres : Express ne reconnaît un
//     gestionnaire d'erreurs qu'à ses QUATRE paramètres (err, req, res, next). Avec trois,
//     il était traité comme un middleware ordinaire.
// Bonus : il renvoyait err.stack au client (fuite d'informations internes), et on le place
// en dernier, après le 404, par convention.
import express from "express";

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next(); // (1)
}); // (2) avant les routes

app.use(express.json());

app.get("/api/articles", (req, res) => res.json([]));

app.post("/api/articles", (req, res) => {
  res.status(201).json({ id: 1, ...req.body }); // (3)
});

app.use((req, res) => res.status(404).json({ erreur: "Route inconnue" }));

// (4) quatre paramètres, même si next n'est pas utilisé
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ erreur: "Erreur interne du serveur" }); // pas de pile
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Exercice 1 sur http://localhost:${PORT}`));
