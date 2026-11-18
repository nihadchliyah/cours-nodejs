import { outilsPour } from "./outils.js";

const estimerJetons = (texte) => Math.ceil(texte.length / 4);
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

const PHRASE =
  "La médiathèque est ouverte du mardi au samedi et propose des livres, des films, des jeux et de la musique pour tous les âges.";

export async function repondre(question) {
  const texte = `[bouchon] Vous avez demandé : ${question.slice(0, 60)}`;
  return { texte, jetons: { input_tokens: estimerJetons(question), output_tokens: estimerJetons(texte) } };
}

export async function* repondreEnFlux(question, { signal, surJetons } = {}) {
  const mots = [];
  while (mots.length < 50) mots.push(...PHRASE.split(" "));
  mots.length = 50;

  let emis = 0;
  try {
    for (const mot of mots) {
      await attendre(100);
      if (signal?.aborted) return;
      yield mot + " ";
      emis++;
    }
  } finally {
    const texte = mots.slice(0, emis).join(" ");
    surJetons?.({ input_tokens: estimerJetons(question), output_tokens: estimerJetons(texte) });
  }
}

export async function repondreAvecOutils(question, { utilisateurId }) {
  if (!/rendre|emprunt/i.test(question)) return repondre(question);

  const emprunts = await outilsPour(utilisateurId).mes_emprunts();
  const dansSeptJours = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const aRendre = emprunts.filter((e) => e.retourPrevuLe <= dansSeptJours);

  const texte =
    aRendre.length === 0
      ? "[bouchon] Vous n'avez rien à rendre cette semaine."
      : `[bouchon] À rendre cette semaine : ${aRendre
          .map((e) => `« ${e.titre} » (${e.auteur}) avant le ${e.retourPrevuLe}`)
          .join(", ")}.`;
  return { texte, jetons: { input_tokens: estimerJetons(question), output_tokens: estimerJetons(texte) } };
}
