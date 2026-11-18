#!/bin/sh
# Trust an optional corporate CA, then point apk at Alpine main + community.
# APK_REPOSITORY_URL may be a single Alpine repo URL (the branch is reused for
# both main and community) or any other single repository URL.
set -eu

if [ -s /tmp/extra-ca.crt ]; then
  mkdir -p /usr/local/share/ca-certificates
  cp /tmp/extra-ca.crt /usr/local/share/ca-certificates/extra-ca.crt
  # First apk needs the cert before update-ca-certificates has run.
  cat /tmp/extra-ca.crt >> /etc/ssl/certs/ca-certificates.crt
fi

url="${APK_REPOSITORY_URL:-}"
case "$url" in
  *alpinelinux.org/alpine/*/*)
    branch=$(printf '%s\n' "$url" | sed -n 's#.*alpinelinux.org/alpine/\([^/]*\)/.*#\1#p')
    printf '%s\n' \
      "https://dl-cdn.alpinelinux.org/alpine/${branch}/main" \
      "https://dl-cdn.alpinelinux.org/alpine/${branch}/community" \
      > /etc/apk/repositories
    ;;
  "")
    ;;
  *)
    printf '%s\n' "$url" > /etc/apk/repositories
    ;;
esac

apk update --no-cache
apk upgrade --no-cache
# apk upgrade rewrites the bundle. Put the corporate CA back.
if [ -s /usr/local/share/ca-certificates/extra-ca.crt ]; then
  update-ca-certificates
fi
