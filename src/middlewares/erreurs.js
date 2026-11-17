import multer from "multer";

export function routeInconnue(req, res) {
  res.status(404).json({ erreur: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

// Gestionnaire d'erreurs central : quatre paramètres, déclaré en dernier.
// eslint-disable-next-line no-unused-vars
export function gestionnaireErreurs(err, req, res, next) {
  // Exercice 5 : les erreurs de multer
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ erreur: "Fichier trop volumineux (500 Ko au plus)" });
    }
    return res.status(400).json({ erreur: `Téléversement refusé : ${err.message}` });
  }

  // JSON mal formé dans le corps (levé par express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erreur: "Corps JSON invalide" });
  }

  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 500) console.error(err);
  // On ne renvoie jamais la pile ni le détail d'une erreur interne au client
  res.status(status).json({ erreur: status >= 500 ? "Erreur interne du serveur" : err.message });
}
