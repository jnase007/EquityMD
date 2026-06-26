# EquityMD Social Pipeline

Tools to turn blog posts into (a) copy-paste LinkedIn/Facebook posts and
(b) custom AI hero images, then push the images live.

## Files
- `gen-blog-images.sh` — generate Imagen 4.0 hero images per post, upload to
  Supabase storage, update `blog_posts.image_url` (matched by **slug**).
- `build-social-page.js` — build the grouped, tap-to-copy HTML page
  (all LinkedIn first, then all Facebook; paste-proof spacing).
- `sample-prompts.json` — example prompt schema (the first 10 posts).

## Generate images
```bash
export GEMINI_API_KEY=...          # Google Generative Language (Imagen) key
export SUPABASE_SERVICE_KEY=...    # service-role key
export SUPABASE_URL=https://<project>.supabase.co
./gen-blog-images.sh prompts.json
```

`prompts.json` schema:
```json
[{ "slug": "post-slug", "title": "Short label", "prompt": "Imagen prompt ..." }]
```

## Prompt tips (learned)
- Always end prompts with: `Plain clean surfaces with no signage or billboards
  anywhere. No text, no words, no letters, no numbers, no logos, no signs anywhere.`
- Avoid "split composition" / side-by-side — it produces collage artifacts and
  garbled text on buildings. Use a single unified scene.
- 16:9, 2K, photorealistic real-estate-magazine framing works best.

## Gotchas (do not repeat)
- **Match by slug, not a truncated UUID.** PostgREST PATCH returns HTTP 200 even
  when it matches 0 rows — always verify `rows=1` in the response.
- Versioned filenames (`...-<timestamp>.png`) bust the CDN cache on re-runs.
- Social copy: expand single `\n` to blank-line breaks so spacing survives
  LinkedIn/Facebook paste (they strip single newlines).

## Secrets
Never hardcode keys. The script reads them from env vars only.
