import { prisma } from "../db/prisma.js";

export function enregistrer(utilisateurId, jetons) {
  return prisma.consommationIa.create({
    data: { utilisateurId, jetonsEntree: jetons.input_tokens, jetonsSortie: jetons.output_tokens },
  });
}

export async function jetonsDuJour(utilisateurId) {
  const debutJournee = new Date();
  debutJournee.setHours(0, 0, 0, 0);
  const { _sum } = await prisma.consommationIa.aggregate({
    where: { utilisateurId, date: { gte: debutJournee } },
    _sum: { jetonsEntree: true, jetonsSortie: true },
  });
  return (_sum.jetonsEntree ?? 0) + (_sum.jetonsSortie ?? 0);
}
