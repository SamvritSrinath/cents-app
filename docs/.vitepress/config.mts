import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitepress';

const repo = 'https://github.com/SamvritSrinath/cents-app';

const VPRESS_DIR = dirname(fileURLToPath(import.meta.url));
const API_INDEX_DEV = join(VPRESS_DIR, 'public/api/index.html');
const API_INDEX_PREVIEW = join(VPRESS_DIR, 'dist/api/index.html');

/** TypeDoc HTML lives under public/api; VitePress SPA would otherwise 404 on /api/. */
function apiDirectoryIndexServe(): Plugin {
  return {
    name: 'cents-api-directory-index',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = (req as { url?: string }).url?.split('?')[0] ?? '';
        const base = server.config.base;
        const root = base.endsWith('/') ? base.slice(0, -1) : base;
        if (raw !== `${root}/api` && raw !== `${root}/api/`) return next();
        if (!existsSync(API_INDEX_DEV)) return next();
        const out = res as {
          setHeader: (k: string, v: string) => void;
          end: (b: string) => void;
        };
        out.setHeader('Content-Type', 'text/html; charset=utf-8');
        out.end(readFileSync(API_INDEX_DEV, 'utf-8'));
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = (req as { url?: string }).url?.split('?')[0] ?? '';
        const base = server.config.base;
        const root = base.endsWith('/') ? base.slice(0, -1) : base;
        if (raw !== `${root}/api` && raw !== `${root}/api/`) return next();
        if (!existsSync(API_INDEX_PREVIEW)) return next();
        const out = res as {
          setHeader: (k: string, v: string) => void;
          end: (b: string) => void;
        };
        out.setHeader('Content-Type', 'text/html; charset=utf-8');
        out.end(readFileSync(API_INDEX_PREVIEW, 'utf-8'));
      });
    },
  };
}

export default defineConfig({
  title: 'Cents',
  description:
    'Android-first expense tracking with Expo, React Native, and Supabase — guides plus TypeDoc API reference.',
  base: '/cents-app/',
  srcDir: '.',
  srcExclude: ['**/generated/**'],
  ignoreDeadLinks: [/^\/api(?:\/|$)/],

  vite: {
    plugins: [apiDirectoryIndexServe()],
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API (TypeDoc)', link: '/api/index.html' },
      { text: 'GitHub', link: repo },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting oriented',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'API reference (TypeDoc)', link: '/api/index.html' },
            { text: 'About API & TSDoc', link: '/guide/api-reference' },
          ],
        },
        {
          text: 'Security & data',
          items: [
            { text: 'Backend & security', link: '/guide/backend-security' },
            { text: 'Receipt OCR service', link: '/guide/ocr-service' },
          ],
        },
        {
          text: 'Shipping & quality',
          items: [
            { text: 'CI & local checks', link: '/guide/ci-and-quality' },
            { text: 'Release & EAS', link: '/guide/release' },
            { text: 'Performance', link: '/guide/performance' },
          ],
        },
        {
          text: 'Project',
          items: [
            {
              text: 'Contributing',
              link: `${repo}/blob/main/CONTRIBUTING.md`,
            },
            {
              text: 'Security policy',
              link: `${repo}/blob/main/SECURITY.md`,
            },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: repo }],

    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2025 Samvrit Srinath',
    },

    search: {
      provider: 'local',
    },

    outline: { level: [2, 3] },
  },
});
