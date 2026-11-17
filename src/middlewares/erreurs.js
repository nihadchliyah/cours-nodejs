export function routeInconnue(req, res) {
  res.status(404).json({ erreur: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

// Gestionnaire d'erreurs central : quatre paramètres, déclaré en dernier.
// eslint-disable-next-line no-unused-vars
export function gestionnaireErreurs(err, req, res, next) {
  // JSON mal formé dans le corps (levé par express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erreur: "Corps JSON invalide" });
  }

  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 500) console.error(err);
  // On ne renvoie jamais la pile ni le détail d'une erreur interne au client
  res.status(status).json({ erreur: status >= 500 ? "Erreur interne du serveur" : err.message });
}
