#!/bin/bash
# Render the resume to HTML and publish it to GitHub Pages.
#
# The web build omits the phone number (RESUME_TARGET=web); build.sh keeps it
# in the PDF. gh-pages holds nothing but the rendered index.html, so it is
# built here with plumbing commands rather than checked out — resume.html is
# gitignored, and this leaves the working tree and index untouched.
set -euo pipefail
cd "$(dirname "$0")"

RESUME_TARGET=web npx resumed render resume.json -o resume.html

# Never publish the phone number, whatever the theme did.
PHONE=$(python3 -c "import json; print(json.load(open('resume.json'))['basics'].get('phone',''))")
if [ -n "$PHONE" ] && grep -qF "$PHONE" resume.html; then
  echo "refusing to publish: phone number found in resume.html" >&2
  exit 1
fi

BLOB=$(git hash-object -w resume.html)
TREE=$(printf '100644 blob %s\tindex.html\n' "$BLOB" | git mktree)
MSG="publish resume to GitHub Pages

Rendered from resume.json at $(git rev-parse --short HEAD)."

# Build on the previous gh-pages commit so the push is a fast-forward.
PARENT=$(git rev-parse -q --verify gh-pages || true)
if [ -n "$PARENT" ]; then
  COMMIT=$(git commit-tree "$TREE" -p "$PARENT" -m "$MSG")
else
  COMMIT=$(git commit-tree "$TREE" -m "$MSG")
fi

git branch -f gh-pages "$COMMIT"
git push origin gh-pages
echo "published: https://rob-odwyer.github.io/resume/"
