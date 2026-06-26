#!/usr/bin/env node
import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const logDir = path.join(projectRoot, ".monitor");
const logFile = path.join(logDir, "errors.log");

function logAlert(message) {
  mkdirSync(logDir, { recursive: true });
  appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
  console.error(`ALERTA: ${message}`);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function runChecks() {
  const checks = [
    {
      label: "TypeScript",
      command: process.platform === "win32" ? "npx.cmd" : "npx",
      args: ["tsc", "--noEmit"],
    },
    {
      label: "ESLint",
      command: process.platform === "win32" ? "npx.cmd" : "npx",
      args: ["eslint", "app", "next.config.ts", "prisma.config.ts"],
    },
  ];

  const results = [];

  for (const check of checks) {
    const result = await runCommand(check.command, check.args);
    results.push({ ...check, ...result });
  }

  const failed = results.filter((result) => result.code !== 0);

  if (failed.length > 0) {
    const summary = failed.map((item) => `${item.label} (código ${item.code})`).join(", ");
    logAlert(`Problemas encontrados nas verificações: ${summary}`);
    return false;
  }

  console.log(`Tudo certo: verificações concluídas sem erros em ${new Date().toLocaleString("pt-BR")}.`);
  return true;
}

async function main() {
  const once = process.argv.includes("--once");
  const intervalMs = Number(process.env.MONITOR_INTERVAL_MS || 600000);

  const ok = await runChecks();

  if (once) {
    process.exit(ok ? 0 : 1);
  }

  console.log(`Bot ativo. Verificando a cada ${Math.round(intervalMs / 60000)} minuto(s).`);
  setInterval(async () => {
    await runChecks();
  }, intervalMs);
}

main().catch((error) => {
  logAlert(`Falha ao executar o monitor: ${error.message}`);
  process.exit(1);
});
