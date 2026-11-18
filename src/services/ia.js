import OpenAI from "openai";

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

export async function* repondreEnFlux(question) {
  const flux = await client.responses.create({
    model: modele,
    instructions: INSTRUCTIONS,
    input: question,
    stream: true,
    max_output_tokens: 300,
  });
  for await (const evenement of flux) {
    if (evenement.type === "response.output_text.delta") yield evenement.delta;
    if (evenement.type === "response.completed") console.log("jetons", evenement.response.usage);
  }
}
