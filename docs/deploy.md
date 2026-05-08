# Deploy

Live site: https://baditaflorin.github.io/room-vj/

Repository: https://github.com/baditaflorin/room-vj

## Topology

Mode A: GitHub Pages only. The site publishes from `main` branch `/docs`.

## Publish

```bash
npm install
make build
git add docs package.json package-lock.json
git commit -m "ops: publish pages build"
git push
```

GitHub Pages settings:

- Branch: `main`
- Folder: `/docs`
- URL: https://baditaflorin.github.io/room-vj/

## Rollback

Revert the publishing commit and push:

```bash
git revert <commit>
git push
```

## Custom Domain

No custom domain is configured in v0.1.0. To add one, create `docs/CNAME`, configure DNS with the domain provider, then update the Pages settings in GitHub.

## Pages Gotchas

- Vite `base` must stay `/room-vj/`.
- `docs/404.html` is copied from `docs/index.html` for SPA fallback.
- `_headers` and `_redirects` are not supported by GitHub Pages.
- Service worker scope must remain `/room-vj/`.
