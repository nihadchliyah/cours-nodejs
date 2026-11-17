-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "tachesEnCours" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tache" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(150) NOT NULL,
    "faite" BOOLEAN NOT NULL DEFAULT false,
    "proprietaireId" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Tache_faite_idx" ON "Tache"("faite");

-- CreateIndex
CREATE UNIQUE INDEX "Tache_titre_proprietaireId_key" ON "Tache"("titre", "proprietaireId");

-- AddForeignKey
ALTER TABLE "Tache" ADD CONSTRAINT "Tache_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
