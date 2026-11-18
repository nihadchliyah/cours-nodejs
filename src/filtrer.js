import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";

const [source, cible] = process.argv.slice(2);

if (!source || !cible) {
  console.error("Usage : node src/filtrer.js <fichier source> <fichier cible>");
  process.exit(1);
}

let lignesEcrites = 0;

async function* lignesEnErreur(flux) {
  const lignes = createInterface({ input: flux, crlfDelay: Infinity });
  for await (const ligne of lignes) {
    if (ligne.split(";")[2]?.trim() === "erreur") {
      lignesEcrites++;
      yield ligne + "\n";
    }
  }
}

await pipeline(createReadStream(source), lignesEnErreur, createWriteStream(cible));

console.log(`${lignesEcrites} lignes écrites dans ${cible}`);
