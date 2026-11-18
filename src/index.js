import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API médiathèque sur http://localhost:${port} (IA : ${process.env.IA_FOURNISSEUR ?? "openai"})`);
});
