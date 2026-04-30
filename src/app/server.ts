import app from "./app.js";
import "dotenv/config";
import { env } from "../schemas/env.schema.js";

const port = env.PORT ?? 3000;

app.listen(port, () => console.log(`http://localhost:${port}`));
