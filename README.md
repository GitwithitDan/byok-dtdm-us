# byok-dtdm-us

Static site for **byok.dtdm.us**. No build step. Cloudflare Workers Static Assets serves the `public/` folder.

```
public/index.html                  directory page
public/cost-of-living/index.html   tool page  -> byok.dtdm.us/cost-of-living
public/tools/cost-of-living.html   the tool itself (single self-contained file; this is what "Copy full code" copies)
public/assets/                     site.css, site.js, fonts.css, fonts/, favicon.svg
public/_headers                    Cloudflare security headers (CSP allows only the three AI providers)
```

## Add a tool

1. Put the single-file tool at `public/tools/<slug>.html`. No external requests; a unique localStorage namespace like `byok.<slug>.`.
2. Copy `public/cost-of-living/index.html` to `public/<slug>/index.html`. Change the title, meta, slug, description, chips, version, and the three paths pointing at `../tools/cost-of-living.html`.
3. Copy the `<article class="tool-card">` block in `public/index.html`. Change its text and the `data-copy` and `href` paths. Update the count next to "Tools".
4. If the tool calls a new API host, add it to `connect-src` in `public/_headers`.
5. Bump the version and date on the tool page and card whenever the tool file changes.

## Deploy (Cloudflare Workers Static Assets)

`wrangler.jsonc` serves only the `public/` folder, so config and README files are never published. Deploy command: `npx wrangler deploy`.
