// Exercice 4 — Middleware de clé d'API
// Exige l'en-tête X-Api-Key égal à process.env.API_KEY, sinon 401.
export function cleApi(req, res, next) {
  const attendue = process.env.API_KEY;
  const recue = req.get("X-Api-Key");
  // Sans API_KEY configurée, on refuse tout (on ne laisse jamais la porte ouverte par défaut).
  // En production, on comparerait avec crypto.timingSafeEqual.
  if (!attendue || recue !== attendue) {
    return res.status(401).json({ erreur: "Clé d'API manquante ou invalide" });
  }
  next();
}

const METHODES_ECRITURE = new Set(["POST", "PATCH", "DELETE"]);

// Applique cleApi aux seules méthodes d'écriture ; les lectures (GET) passent librement.
export function proteger(req, res, next) {
  if (METHODES_ECRITURE.has(req.method)) return cleApi(req, res, next);
  next();
}
