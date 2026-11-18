-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ouvrage" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(150) NOT NULL,
    "auteur" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ouvrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emprunt" (
    "id" SERIAL NOT NULL,
    "ouvrageId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "empruntLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retourPrevuLe" TIMESTAMP(3) NOT NULL,
    "rendu" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Emprunt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Emprunt_utilisateurId_rendu_idx" ON "Emprunt"("utilisateurId", "rendu");

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_ouvrageId_fkey" FOREIGN KEY ("ouvrageId") REFERENCES "Ouvrage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprunt" ADD CONSTRAINT "Emprunt_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
