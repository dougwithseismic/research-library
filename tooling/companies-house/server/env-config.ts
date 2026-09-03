import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import path from "node:path";

for (const candidate of [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../web/.env.local"),
]) {
  if (existsSync(candidate)) {
    loadEnvFile(candidate);
  }
}
