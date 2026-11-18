import { prisma } from "../db/prisma.js";

export function enCours(utilisateurId) {
  return prisma.emprunt.findMany({
    where: { utilisateurId, rendu: false },
    orderBy: { retourPrevuLe: "asc" },
    select: { retourPrevuLe: true, ouvrage: { select: { titre: true, auteur: true } } },
  });
}
