import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { homedir } from "node:os";

export const API_BASE = process.env.BRANDSPEC_API_URL ?? "https://brandspec.tools";

export function getCredentialsPath(): string {
  return join(homedir(), ".config", "brandspec", "credentials");
}

export function loadToken(): string | null {
  const envToken = process.env.BRANDSPEC_TOKEN;
  if (envToken) return envToken;

  const credPath = getCredentialsPath();
  if (existsSync(credPath)) {
    const content = readFileSync(credPath, "utf-8").trim();
    if (content) return content;
  }
  return null;
}

export function parseOrgBrand(str: string): { org: string; brand: string } | null {
  const parts = str.split("/");
  if (parts.length !== 2) return null;
  const [org, brand] = parts;
  const slugRe = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
  if (!slugRe.test(org) || !slugRe.test(brand)) return null;
  return { org, brand };
}

export function loadRemote(args: string[]): { org: string; brand: string } | null {
  const positional = args.find((a) => !a.startsWith("-") && a.includes("/"));
  if (positional) return parseOrgBrand(positional);

  const rcPath = resolve(".brandspecrc");
  if (existsSync(rcPath)) {
    const content = readFileSync(rcPath, "utf-8");
    const match = content.match(/remote:\s*(.+)/);
    if (match) return parseOrgBrand(match[1].trim());
  }
  return null;
}

export function ensureBrandspecrc(org: string, brand: string): void {
  const rcPath = resolve(".brandspecrc");
  if (!existsSync(rcPath)) {
    writeFileSync(rcPath, `remote: ${org}/${brand}\n`, "utf-8");
  }
}

export function saveCredentials(token: string): void {
  const credPath = getCredentialsPath();
  mkdirSync(dirname(credPath), { recursive: true });
  writeFileSync(credPath, token, { mode: 0o600 });
}
