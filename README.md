# byok-dtdm-us

Static site for **byok.dtdm.us**. No build step. Cloudflare Workers Static Assets serves the `public/` folder.

```
public/index.html                  directory page
public/cost-of-living/index.html   tool page  -> byok.dtdm.us/cost-of-living
public/tools/cost-of-living.html   the tool itself (single self-contained file; this is what "Copy full code" copies)
public/assets/                     site.css, site.js, fonts.css, fonts/, favicon.svg
public/_headers                    Cloudflare security headers (CSP allows only api.anthropic.com and openrouter.ai)
```

## Providers

Tools support two providers only: Anthropic (direct) and OpenRouter (any model on one key). Each tool has an `anthropic` and an `openrouter` adapter in its `CALL` table. Do not add other provider hosts without updating `connect-src` in `public/_headers`, the trust copy, the key page, and `public/assets/safety-check-prompt.txt`.

## Add a tool

1. Put the single-file tool at `public/tools/<slug>.html`. No external requests; a unique localStorage namespace like `byok.<slug>.`.
2. Copy `public/cost-of-living/index.html` to `public/<slug>/index.html`. Change the title, meta, slug, description, chips, version, and the three paths pointing at `../tools/cost-of-living.html`.
3. Copy the `<article class="tool-card">` block in `public/index.html`. Change its text and the `data-copy` and `href` paths. Update the count next to "Tools".
4. Keep to the two providers above. A tool that needs live search uses the Anthropic `web_search` tool and the OpenRouter `openrouter:web_search` server tool.
5. Bump the version and date on the tool page and card whenever the tool file changes.

## Deploy (Cloudflare Workers Static Assets)

`wrangler.jsonc` serves only the `public/` folder, so config and README files are never published. Deploy command: `npx wrangler deploy`.
