import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
const configuredSite =
  process.env.SITE_URL?.trim() || 'https://www.aayanamir.tech';
let site;
if (configuredSite) {
  const url = new URL(configuredSite);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    ['localhost', '127.0.0.1'].includes(url.hostname)
  ) {
    throw new Error(
      'SITE_URL must be the public HTTPS production origin, without a path, credentials or query.',
    );
  }
  site = url.origin;
}
export default defineConfig({
  site,
  integrations: [react()],
  output: 'static',
  devToolbar: { enabled: false },
});
