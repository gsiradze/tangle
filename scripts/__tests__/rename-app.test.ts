import { describe, expect, it } from 'vitest';
import {
  parseArgs,
  renameCapacitorConfig,
  renameIndexHtml,
  renameManifest,
  renamePackageJson,
} from '../rename-app';

const ARGS = {
  name: 'Super Puzzle',
  id: 'com.acme.superpuzzle',
  slug: 'super-puzzle',
};

describe('parseArgs', () => {
  it('parses all three flags', () => {
    const parsed = parseArgs([
      '--name',
      'Super Puzzle',
      '--id',
      'com.acme.superpuzzle',
      '--slug',
      'super-puzzle',
    ]);
    expect(parsed).toEqual(ARGS);
  });

  it('throws when a required flag is missing', () => {
    expect(() => parseArgs(['--name', 'X', '--id', 'a.b'])).toThrow(/slug/i);
  });

  it('throws on invalid bundle id', () => {
    expect(() =>
      parseArgs(['--name', 'X', '--id', 'bad id', '--slug', 'x']),
    ).toThrow(/bundle id/i);
  });

  it('throws on invalid slug', () => {
    expect(() =>
      parseArgs(['--name', 'X', '--id', 'a.b.c', '--slug', 'BAD SLUG']),
    ).toThrow(/slug/i);
  });
});

describe('renamePackageJson', () => {
  it('replaces the name field', () => {
    const input = '{\n  "name": "game-template",\n  "version": "0.1.0"\n}\n';
    const out = renamePackageJson(input, ARGS);
    expect(out).toContain('"name": "super-puzzle"');
    expect(out).toContain('"version": "0.1.0"');
  });
});

describe('renameCapacitorConfig', () => {
  it('replaces appId, appName, and Preferences.group', () => {
    const input = `
  appId: 'com.example.gametemplate',
  appName: 'Game Template',
  Preferences: {
    group: 'gametemplate',
  },
`;
    const out = renameCapacitorConfig(input, ARGS);
    expect(out).toContain("appId: 'com.acme.superpuzzle'");
    expect(out).toContain("appName: 'Super Puzzle'");
    expect(out).toContain("group: 'superpuzzle'");
  });
});

describe('renameIndexHtml', () => {
  it('replaces title, apple meta, and description', () => {
    const input = `
    <meta name="apple-mobile-web-app-title" content="Game Template" />
    <meta name="description" content="Phaser 4 + React + Capacitor game template." />
    <title>Game Template</title>
`;
    const out = renameIndexHtml(input, ARGS);
    expect(out).toContain('content="Super Puzzle"');
    expect(out).toContain('<title>Super Puzzle</title>');
    expect(out).toContain('content="Super Puzzle."');
  });
});

describe('renameManifest', () => {
  it('replaces name, short_name, and description', () => {
    const input = `{
  "name": "Game Template",
  "short_name": "Game",
  "description": "Phaser 4 + React + Capacitor game template."
}
`;
    const out = renameManifest(input, ARGS);
    const parsed = JSON.parse(out) as { name: string; short_name: string; description: string };
    expect(parsed.name).toBe('Super Puzzle');
    expect(parsed.short_name).toBe('Super Puzzle');
    expect(parsed.description).toBe('Super Puzzle.');
  });
});
