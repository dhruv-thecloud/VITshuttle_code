#!/bin/sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DIST_DIR="$PROJECT_ROOT/dist"
OUTPUT_ARCHIVE="$DIST_DIR/vit-shuttle-mobile-app.zip"

mkdir -p "$DIST_DIR"

cd "$PROJECT_ROOT"

zip -rq "$OUTPUT_ARCHIVE" \
  index.html \
  signup.html \
  student.html \
  driver-login.html \
  driver.html \
  styles.css \
  app.js \
  auth.js \
  driver-auth.js \
  google-config.js \
  google-config.example.js \
  manifest.webmanifest \
  sw.js \
  README.md \
  icons

printf 'Created %s\n' "$OUTPUT_ARCHIVE"
