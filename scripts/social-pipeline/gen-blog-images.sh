#!/bin/bash
# Generate custom Imagen 4.0 hero images for EquityMD blog posts,
# upload to Supabase storage, and update blog_posts.image_url.
#
# Requires env vars (do NOT hardcode secrets):
#   GEMINI_API_KEY              - Google Generative Language (Imagen) key
#   SUPABASE_SERVICE_KEY        - Supabase service-role key
#   SUPABASE_URL                - e.g. https://<project>.supabase.co
#
# Input: prompts.json -> [{ "slug": "...", "title": "...", "prompt": "..." }, ...]
#   Match the DB row by SLUG (unique). Do NOT use truncated UUIDs.
#
# Usage:  GEMINI_API_KEY=... SUPABASE_SERVICE_KEY=... SUPABASE_URL=... \
#           ./gen-blog-images.sh prompts.json
set -e
cd "$(dirname "$0")"

PROMPTS="${1:-prompts.json}"
: "${GEMINI_API_KEY:?set GEMINI_API_KEY}"
: "${SUPABASE_SERVICE_KEY:?set SUPABASE_SERVICE_KEY}"
: "${SUPABASE_URL:?set SUPABASE_URL}"
SVC="$SUPABASE_SERVICE_KEY"
SUPA="$SUPABASE_URL"

mkdir -p blog-images
STAMP=$(date +%s)
N=$(python3 -c "import json;print(len(json.load(open('$PROMPTS'))))")
echo "Generating $N images from $PROMPTS ..."

for i in $(seq 0 $((N-1))); do
  SLUG=$(python3 -c "import json;print(json.load(open('$PROMPTS'))[$i]['slug'])")
  TITLE=$(python3 -c "import json;print(json.load(open('$PROMPTS'))[$i].get('title',''))")
  PROMPT=$(python3 -c "import json;print(json.load(open('$PROMPTS'))[$i]['prompt'])")
  OUT="blog-images/${SLUG}.png"
  echo ""
  echo "[$((i+1))/$N] $TITLE"

  if [ ! -s "$OUT" ]; then
    for MODEL in imagen-4.0-generate-001 imagen-4.0-ultra-generate-001; do
      curl -s "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:predict?key=$GEMINI_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"instances\":[{\"prompt\":$(python3 -c "import json,sys;print(json.dumps(sys.argv[1]))" "$PROMPT")}],\"parameters\":{\"sampleCount\":1,\"aspectRatio\":\"16:9\",\"sampleImageSize\":\"2K\"}}" \
        -o "resp_${i}.json"
      python3 -c "
import json,base64,sys
d=json.load(open('resp_${i}.json'))
p=d.get('predictions',[])
if not p: print('   no preds:',json.dumps(d)[:200]);sys.exit(1)
b=p[0].get('bytesBase64Encoded')
if not b: print('   no bytes');sys.exit(1)
open('$OUT','wb').write(base64.b64decode(b)); print('   generated ($MODEL)',len(base64.b64decode(b)),'bytes')
" && break
    done
  else
    echo "   (already generated, skipping)"
  fi
  [ -s "$OUT" ] || { echo "   !! FAILED, skipping"; continue; }

  DEST="blog-images/eqmd-${SLUG}-${STAMP}.png"
  curl -s -X POST "$SUPA/storage/v1/object/images/${DEST}" \
    -H "Authorization: Bearer $SVC" -H "apikey: $SVC" \
    -H "Content-Type: image/png" --data-binary @"$OUT" >/dev/null
  PUBURL="$SUPA/storage/v1/object/public/images/${DEST}"

  # Match by SLUG (unique). PostgREST returns 200 even on 0 rows, so verify count.
  curl -s -o /tmp/_patch.json -X PATCH "$SUPA/rest/v1/blog_posts?slug=eq.${SLUG}" \
    -H "Authorization: Bearer $SVC" -H "apikey: $SVC" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "{\"image_url\":\"${PUBURL}\"}" >/dev/null
  ROWS=$(python3 -c "import json;print(len(json.load(open('/tmp/_patch.json'))))" 2>/dev/null || echo "?")
  echo "   uploaded + DB updated (rows=$ROWS) -> $PUBURL"
done
echo ""
echo "ALL DONE."
