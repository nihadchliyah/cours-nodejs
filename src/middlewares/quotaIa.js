import { jetonsDuJour } from "../depots/consommation.js";

export function quotaIa(limiteJetonsParJour) {
  return async (req, res, next) => {
    const consommes = await jetonsDuJour(req.utilisateur.sub);
    if (consommes >= limiteJetonsParJour) {
      return res.status(429).json({
        erreur: "Quota d'utilisation de l'assistant atteint pour aujourd'hui",
        consommes,
        limite: limiteJetonsParJour,
      });
    }
    next();
  };
}
