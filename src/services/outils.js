import * as emprunts from "../depots/emprunts.js";

export const definitions = [
  {
    type: "function",
    name: "mes_emprunts",
    description: "Liste les emprunts en cours de l'utilisateur connecté, avec leur date de retour prévue.",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    strict: true,
  },
];

export function outilsPour(utilisateurId) {
  return {
    mes_emprunts: async () =>
      (await emprunts.enCours(utilisateurId)).map((e) => ({
        titre: e.ouvrage.titre,
        auteur: e.ouvrage.auteur,
        retourPrevuLe: e.retourPrevuLe.toISOString().slice(0, 10),
      })),
  };
}
