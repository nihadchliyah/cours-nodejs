import type { Prisma, PrismaClient, Tache } from "../prisma/generated/client.ts";

export interface DepotTaches {
  lister(page: number, limite: number): Promise<Tache[]>;
  trouver(id: number): Promise<Tache | null>;
  creer(donnees: Prisma.TacheCreateInput): Promise<Tache>;
}

export function creerDepot(prisma: PrismaClient): DepotTaches {
  return {
    lister: (page, limite) => prisma.tache.findMany({ skip: (page - 1) * limite, take: limite }),
    trouver: (id) => prisma.tache.findUnique({ where: { id } }),
    creer: (donnees) => prisma.tache.create({ data: donnees }),
  };
}
