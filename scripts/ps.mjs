#!/usr/bin/env node
/**
 * ps.mjs — запуск инструментов /premiumsite из проекта на любой ОС.
 *   node scripts/ps.mjs gate [--url …]     проверка качества
 *   node scripts/ps.mjs <инструмент> …     scout, palette, shots, registry, modules, brief
 * Ищет скилл в ~/.claude/skills/premiumsite, затем в ./.claude/skills/premiumsite.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [tool, ...rest] = process.argv.slice(2);
const dirs = [
  path.join(os.homedir(), '.claude', 'skills', 'premiumsite', 'scripts'),
  path.join(process.cwd(), '.claude', 'skills', 'premiumsite', 'scripts'),
];
const dir = dirs.find((d) => fs.existsSync(path.join(d, `${tool}.mjs`)));
if (!tool || !dir) {
  console.error(`Инструмент «${tool ?? ''}» не найден. Есть: ${fs.existsSync(dirs[0]) ? fs.readdirSync(dirs[0]).map((f) => f.replace('.mjs', '')).join(', ') : 'скилл premiumsite не установлен'}`);
  process.exit(1);
}
const r = spawnSync(process.execPath, [path.join(dir, `${tool}.mjs`), ...rest], { stdio: 'inherit' });
process.exit(r.status ?? 1);
