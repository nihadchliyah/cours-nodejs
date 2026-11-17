import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API de tâches sur http://localhost:${port}/api/taches`);
});
