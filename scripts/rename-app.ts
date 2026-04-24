import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface RenameArgs {
  readonly name: string;
  readonly id: string;
  readonly slug: string;
}

const BUNDLE_ID_RE = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,}$/;
const SLUG_RE = /^[a-z][a-z0-9-]*$/;

export function parseArgs(argv: readonly string[]): RenameArgs {
  let name: string | undefined;
  let id: string | undefined;
  let slug: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!value) continue;
    if (flag === '--name') name = value;
    if (flag === '--id') id = value;
    if (flag === '--slug') slug = value;
  }
  if (!name) throw new Error('Missing required flag: --name "<Display Name>"');
  if (!id) throw new Error('Missing required flag: --id "<bundle.id>"');
  if (!slug) throw new Error('Missing required flag: --slug "<package-slug>"');
  if (!BUNDLE_ID_RE.test(id)) {
    throw new Error(
      `Invalid bundle id "${id}" — expected reverse-DNS form like com.acme.game`,
    );
  }
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}" — expected lowercase letters, digits, and hyphens`,
    );
  }
  return { name, id, slug };
}

function prefGroupFromSlug(slug: string): string {
  return slug.replace(/-/g, '');
}

export function renamePackageJson(contents: string, args: RenameArgs): string {
  return contents.replace(/"name"\s*:\s*"game-template"/, `"name": "${args.slug}"`);
}

export function renameCapacitorConfig(contents: string, args: RenameArgs): string {
  return contents
    .replace(/appId:\s*'com\.example\.gametemplate'/, `appId: '${args.id}'`)
    .replace(/appName:\s*'Game Template'/, `appName: '${args.name}'`)
    .replace(/group:\s*'gametemplate'/, `group: '${prefGroupFromSlug(args.slug)}'`);
}

export function renameIndexHtml(contents: string, args: RenameArgs): string {
  return contents
    .replace(
      /content="Phaser 4 \+ React \+ Capacitor game template\."/,
      `content="${args.name}."`,
    )
    .replace(
      /content="Game Template"/g,
      `content="${args.name}"`,
    )
    .replace(/<title>Game Template<\/title>/, `<title>${args.name}</title>`);
}

export function renameManifest(contents: string, args: RenameArgs): string {
  const parsed = JSON.parse(contents) as Record<string, unknown>;
  parsed.name = args.name;
  parsed.short_name = args.name;
  parsed.description = `${args.name}.`;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

function rewrite(filePath: string, fn: (text: string) => string): void {
  const abs = resolve(process.cwd(), filePath);
  const original = readFileSync(abs, 'utf8');
  const next = fn(original);
  if (next === original) {
    console.warn(`[rename] no change: ${filePath}`);
    return;
  }
  writeFileSync(abs, next);
  console.info(`[rename] updated: ${filePath}`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  rewrite('package.json', t => renamePackageJson(t, args));
  rewrite('capacitor.config.ts', t => renameCapacitorConfig(t, args));
  rewrite('index.html', t => renameIndexHtml(t, args));
  rewrite('public/manifest.webmanifest', t => renameManifest(t, args));
  console.info('[rename] done. Next: `rm -rf ios android && npx cap add ios && npx cap add android`');
}

const invokedDirectly =
  typeof process !== 'undefined' && process.argv[1]?.endsWith('rename-app.ts') === true;
if (invokedDirectly) {
  try {
    main();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
