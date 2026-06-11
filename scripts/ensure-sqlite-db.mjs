import { mkdir, open } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const databasePath = join(root, "prisma", "dev.db");

await mkdir(dirname(databasePath), { recursive: true });

const file = await open(databasePath, "a");
await file.close();
