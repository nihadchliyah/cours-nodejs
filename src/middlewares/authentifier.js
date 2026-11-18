import { verifierJeton } from "../securite/jetons.js";

export async function authentifier(req, res, next) {
  const [type, jeton] = (req.get("Authorization") ?? "").split(" ");
  if (type !== "Bearer" || !jeton) return res.status(401).json({ erreur: "Authentification requise" });

  let payload;
  try {
    payload = await verifierJeton(jeton);
  } catch {
    return res.status(401).json({ erreur: "Jeton invalide ou expiré" });
  }
  req.utilisateur = { sub: Number(payload.sub), email: payload.email };
  next();
}
