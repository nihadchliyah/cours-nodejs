import { prisma } from "../db/prisma.js";

// Exercice 3 — Pagination et total
export async function lister({ page = 1, limite = 10, faite, q } = {}) {
  const where = {};
  if (faite !== undefined) where.faite = faite;
  if (q) where.titre = { contains: q, mode: "insensitive" };

  // Les deux requêtes partent en même temps, avec le même filtre
  const [donnees, total] = await Promise.all([
    prisma.tache.findMany({
      where,
      orderBy: { id: "asc" }, // tri stable : sinon les pages peuvent se chevaucher
      skip: (page - 1) * limite,
      take: limite,
    }),
    prisma.tache.count({ where }),
  ]);

  return { donnees, page, limite, total, pages: Math.ceil(total / limite) };
}
