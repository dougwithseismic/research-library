#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  GOOGLE_ADS_SCOPE,
  loadGoogleAdsEnvironment,
  requireEnvironment,
} from "./lib/google-ads.mjs";

function base64Url(value) {
  return value.toString("base64url");
}

async function copyToClipboard(value) {
  if (process.platform !== "darwin") return false;
  const child = spawn("pbcopy", [], { stdio: ["pipe", "ignore", "inherit"] });
  child.stdin.end(value);
  const [code] = await once(child, "close");
  if (code !== 0) throw new Error(`pbcopy exited with status ${code}`);
  return true;
}

async function exchangeAuthorizationCode({
  code,
  codeVerifier,
  redirectUri,
  clientId,
  clientSecret,
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.refresh_token) {
    const message =
      payload.error_description ?? payload.error ?? `HTTP ${response.status}`;
    throw new Error(`OAuth authorization failed: ${message}`);
  }
  return payload.refresh_token;
}

loadGoogleAdsEnvironment();
const {
  GOOGLE_ADS_CLIENT_ID: clientId,
  GOOGLE_ADS_CLIENT_SECRET: clientSecret,
} = requireEnvironment(["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET"]);

const state = base64Url(randomBytes(24));
const codeVerifier = base64Url(randomBytes(48));
const codeChallenge = base64Url(
  createHash("sha256").update(codeVerifier).digest(),
);
let settled = false;

const server = createServer(async (request, response) => {
  if (settled) {
    response.writeHead(409, { "content-type": "text/plain; charset=utf-8" });
    response.end("Authorization has already completed.");
    return;
  }

  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (url.pathname !== "/oauth/callback") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found.");
    return;
  }

  if (url.searchParams.get("state") !== state) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("OAuth state mismatch. Close this tab and retry.");
    return;
  }

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  if (error || !code) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Authorization was not completed: ${error ?? "missing code"}`);
    return;
  }

  settled = true;
  try {
    const redirectUri = `http://127.0.0.1:${server.address().port}/oauth/callback`;
    const refreshToken = await exchangeAuthorizationCode({
      code,
      codeVerifier,
      redirectUri,
      clientId,
      clientSecret,
    });
    const copied = await copyToClipboard(refreshToken);
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(
      "<!doctype html><title>Research Library authorized</title><h1>Research Library is authorized</h1><p>You can close this tab and return to the terminal.</p>",
    );
    console.log(
      copied
        ? "Refresh token copied to the macOS clipboard."
        : "Authorization succeeded, but automatic clipboard copy is unavailable on this platform.",
    );
    process.exitCode = copied ? 0 : 2;
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Authorization failed. Return to the terminal for details.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(0, "127.0.0.1", () => {
  const redirectUri = `http://127.0.0.1:${server.address().port}/oauth/callback`;
  const authorizationUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_ADS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  console.log("Open this URL in a browser to authorize Research Library:");
  console.log(authorizationUrl.href);
});

const timeout = setTimeout(
  () => {
    console.error("Authorization timed out after fifteen minutes.");
    server.close();
    process.exitCode = 1;
  },
  15 * 60 * 1000,
);
timeout.unref();
