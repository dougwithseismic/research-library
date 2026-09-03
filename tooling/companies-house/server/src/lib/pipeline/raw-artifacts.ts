import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

export type StoredRawArtifact = {
  id: string;
  contentHash: string;
  byteLength: number;
  contentType: string;
  storageUri: string;
};

function extension(contentType: string) {
  if (contentType.includes("json")) return ".json";
  if (contentType.includes("html")) return ".html";
  if (contentType.includes("xml")) return ".xml";
  if (contentType.includes("zip")) return ".zip";
  return ".bin";
}

export class FilesystemRawArtifactStore {
  constructor(
    private readonly root = process.env.COMPANIES_HOUSE_RAW_DIR ??
      path.resolve(process.cwd(), "private-data/companies-house/raw"),
  ) {}

  private destination(hash: string, contentType: string) {
    return path.join(
      this.root,
      hash.slice(0, 2),
      `${hash}${extension(contentType)}`,
    );
  }

  async putBuffer(
    value: Buffer | string,
    contentType: string,
  ): Promise<StoredRawArtifact> {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const contentHash = createHash("sha256").update(buffer).digest("hex");
    const destination = this.destination(contentHash, contentType);
    await mkdir(path.dirname(destination), { recursive: true });
    try {
      await writeFile(destination, buffer, { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    return {
      id: `sha256:${contentHash}`,
      contentHash,
      byteLength: buffer.byteLength,
      contentType,
      storageUri: destination,
    };
  }

  async putJson(value: unknown): Promise<StoredRawArtifact> {
    return this.putBuffer(`${JSON.stringify(value)}\n`, "application/json");
  }

  async putFile(
    source: string,
    contentType: string,
  ): Promise<StoredRawArtifact> {
    const temporary = path.join(this.root, ".tmp", randomUUID());
    await mkdir(path.dirname(temporary), { recursive: true });
    const hash = createHash("sha256");
    let byteLength = 0;
    await new Promise<void>((resolve, reject) => {
      const input = createReadStream(source);
      const output = createWriteStream(temporary, { flags: "wx" });
      input.on("data", (chunk: string | Buffer) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        hash.update(buffer);
        byteLength += buffer.length;
      });
      input.on("error", reject);
      output.on("error", reject);
      output.on("finish", resolve);
      input.pipe(output);
    });
    const contentHash = hash.digest("hex");
    const destination = this.destination(contentHash, contentType);
    await mkdir(path.dirname(destination), { recursive: true });
    try {
      await rename(temporary, destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await unlink(temporary);
    }
    return {
      id: `sha256:${contentHash}`,
      contentHash,
      byteLength,
      contentType,
      storageUri: destination,
    };
  }

  async read(artifact: StoredRawArtifact) {
    return readFile(artifact.storageUri);
  }

  async exists(artifact: StoredRawArtifact) {
    try {
      await stat(artifact.storageUri);
      return true;
    } catch {
      return false;
    }
  }
}
