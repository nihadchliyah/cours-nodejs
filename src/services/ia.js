import OpenAI from "openai";
import { definitions, outilsPour } from "./outils.js";

const client = new OpenAI();
const modele = process.env.OPENAI_MODELE ?? "gpt-4.1-mini";
const INSTRUCTIONS = "Vous êtes l'assistant d'une médiathèque. Répondez en français, brièvement.";

export async function repondre(question) {
  const reponse = await client.responses.create({
    model: modele,
    instructions: INSTRUCTIONS,
    input: question,
    max_output_tokens: 300,
  });
  return { texte: reponse.output_text, jetons: reponse.usage };
}

export async function* repondreEnFlux(question, { signal, surJetons } = {}) {
  const flux = await client.responses.create(
    { model: modele, instructions: INSTRUCTIONS, input: question, stream: true, max_output_tokens: 300 },
    { signal },
  );
  for await (const evenement of flux) {
    if (evenement.type === "response.output_text.delta") yield evenement.delta;
    if (evenement.type === "response.completed") surJetons?.(evenement.response.usage);
  }
}

export async function repondreAvecOutils(question, { utilisateurId }) {
  const outils = outilsPour(utilisateurId);
  const instructions = `${INSTRUCTIONS} Nous sommes le ${new Date().toISOString().slice(0, 10)}.`;
  const parametres = { model: modele, instructions, tools: definitions, max_output_tokens: 300 };
  const entree = [{ role: "user", content: question }];

  let reponse = await client.responses.create({ ...parametres, input: entree });
  const jetons = { input_tokens: reponse.usage.input_tokens, output_tokens: reponse.usage.output_tokens };

  const appels = reponse.output.filter((item) => item.type === "function_call");
  for (const appel of appels) {
    const outil = outils[appel.name];
    const resultat = outil ? await outil() : { erreur: `Outil inconnu : ${appel.name}` };
    entree.push(appel, { type: "function_call_output", call_id: appel.call_id, output: JSON.stringify(resultat) });
  }

  if (appels.length > 0) {
    reponse = await client.responses.create({ ...parametres, input: entree });
    jetons.input_tokens += reponse.usage.input_tokens;
    jetons.output_tokens += reponse.usage.output_tokens;
  }
  return { texte: reponse.output_text, jetons };
}
