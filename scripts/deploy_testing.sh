#!/usr/bin/env bash
# Blue/green deploy for PLS web testing frontend (Next.js). Runs on the server, called by cd.yml over SSH.
#
#   The image is built on the GitHub runner and loaded with `docker load` before this script runs;
#   APP_IMAGE in .env names it. Nothing is built on the server.
#   active slot  = the container Nginx currently proxies to (blue:3050 or green:3051)
#   new slot     = the other one; it is started and health-checked BEFORE Nginx switches,
#                  so the site never goes down. The old slot is stopped (not removed)
#                  after a short drain, and can be started again by rollback_testing.sh.
#
# Sourced by rollback_testing.sh for the shared functions (nothing runs when sourced).
set -euo pipefail

DEPLOY_BASE_DIR="${DEPLOY_BASE_DIR:-/root/pls_web_testing/frontend}"
WEB_DOMAIN="${WEB_DOMAIN:-plstest.pls.edu.vn}"
BLUE_PORT="${APP_BLUE_HOST_PORT:-3050}"
GREEN_PORT="${APP_GREEN_HOST_PORT:-3051}"
CERT_DIR="${CERT_DIR:-/etc/nginx/ssl/pls.edu.vn}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/conf.d/$WEB_DOMAIN.conf}"
HTTPS_TEMPLATE="${HTTPS_TEMPLATE:-$DEPLOY_BASE_DIR/deploy/nginx/pls_web_frontend.testing.conf}"
HTTP_TEMPLATE="${HTTP_TEMPLATE:-$DEPLOY_BASE_DIR/deploy/nginx/pls_web_frontend.testing.http.conf}"
STATE_DIR="${STATE_DIR:-$DEPLOY_BASE_DIR/.deploy-state}"
ACTIVE_SLOT_FILE="$STATE_DIR/active_slot"
IMAGE_REPO="${IMAGE_REPO:-pls-web-testing-frontend}"
CONTAINER_PREFIX="${CONTAINER_PREFIX:-pls-web-testing-frontend}"   # containers are <prefix>-blue / <prefix>-green
HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-30}"
DRAIN_SECONDS="${DRAIN_SECONDS:-8}"
MIN_FREE_DISK_MB="${MIN_FREE_DISK_MB:-1024}"

export COMPOSE_PROFILES=bluegreen
export COMPOSE_FILE="${COMPOSE_FILE_TESTING:-docker-compose.testing.yml}"

slot_port() {
  case "$1" in
    blue) echo "$BLUE_PORT" ;;
    green) echo "$GREEN_PORT" ;;
    *) echo "Unknown slot: $1" >&2; return 1 ;;
  esac
}

other_slot() {
  case "$1" in
    blue) echo green ;;
    green) echo blue ;;
    *) echo blue ;;
  esac
}

# Prints "blue", "green" or "" (nothing active yet). State file first, Nginx conf as fallback.
detect_active_slot() {
  local slot="" port=""
  if [ -f "$ACTIVE_SLOT_FILE" ]; then
    slot="$(tr -d '[:space:]' < "$ACTIVE_SLOT_FILE")"
  fi
  if [ "$slot" != blue ] && [ "$slot" != green ] && [ -f "$NGINX_CONF" ]; then
    port="$(sed -n 's/.*proxy_pass http:\/\/127\.0\.0\.1:\([0-9][0-9]*\);.*/\1/p' "$NGINX_CONF" | tail -n 1 || true)"
    if [ "$port" = "$BLUE_PORT" ]; then slot=blue
    elif [ "$port" = "$GREEN_PORT" ]; then slot=green
    else slot=""
    fi
  fi
  printf '%s' "$slot"
}

check_free_disk() {
  local path="$1" available_mb
  available_mb="$(df -Pm "$path" | awk 'NR == 2 {print $4}')"
  if [ -z "$available_mb" ] || [ "$available_mb" -lt "$MIN_FREE_DISK_MB" ]; then
    echo "Not enough free disk on $path: ${available_mb:-?}MB free, need ${MIN_FREE_DISK_MB}MB." >&2
    return 1
  fi
  echo "Free disk on $path: ${available_mb}MB"
}

wait_for_health() {
  local port="$1" label="$2" attempt
  for attempt in $(seq 1 "$HEALTH_ATTEMPTS"); do
    if curl -fsS --max-time 5 "http://127.0.0.1:$port/health" >/dev/null; then
      echo "$label is healthy on 127.0.0.1:$port"
      return 0
    fi
    sleep 2
  done
  echo "$label did not become healthy on 127.0.0.1:$port after $HEALTH_ATTEMPTS attempts" >&2
  return 1
}

# Renders the HTTPS template when the wildcard cert exists, else the HTTP one, points it at
# the given app port, validates and reloads Nginx. Restores the previous conf if nginx -t fails.
# Sets $nginx_mode to https|http.
switch_nginx_to_port() {
  local port="$1" rendered previous
  rendered="$(mktemp)"
  if [[ -f "$CERT_DIR/fullchain.pem" && -f "$CERT_DIR/privkey.pem" ]]; then
    sed -e "s|__WEB_DOMAIN__|$WEB_DOMAIN|g" -e "s|__APP_HOST_PORT__|$port|g" -e "s|__CERT_DIR__|$CERT_DIR|g" \
        "$HTTPS_TEMPLATE" > "$rendered"
    nginx_mode=https
  else
    sed -e "s|__WEB_DOMAIN__|$WEB_DOMAIN|g" -e "s|__APP_HOST_PORT__|$port|g" "$HTTP_TEMPLATE" > "$rendered"
    nginx_mode=http
  fi
  previous=""
  if [ -f "$NGINX_CONF" ]; then
    previous="$(mktemp)"
    cp "$NGINX_CONF" "$previous"
  fi
  install -m 644 "$rendered" "$NGINX_CONF"
  rm -f "$rendered"
  restorecon -F "$NGINX_CONF" >/dev/null 2>&1 || true
  if ! nginx -t; then
    echo "nginx -t failed for the new config; restoring the previous one." >&2
    if [ -n "$previous" ]; then install -m 644 "$previous" "$NGINX_CONF"; rm -f "$previous"; else rm -f "$NGINX_CONF"; fi
    return 1
  fi
  [ -n "$previous" ] && rm -f "$previous"
  systemctl reload nginx
  echo "Nginx now proxies $WEB_DOMAIN ($nginx_mode) to 127.0.0.1:$port"
}

record_active_slot() {
  mkdir -p "$STATE_DIR"
  printf '%s\n' "$1" > "$ACTIVE_SLOT_FILE"
}

# Graceful hand-over: let in-flight requests on the old slot finish, then stop it (kept for rollback).
retire_slot() {
  local slot="$1"
  [ -z "$slot" ] && return 0
  echo "Draining $slot for ${DRAIN_SECONDS}s before stopping it"
  sleep "$DRAIN_SECONDS"
  docker compose stop -t 30 "app_$slot" >/dev/null 2>&1 || true
  echo "Stopped app_$slot (container kept for rollback)"
}

# Hits the public URL through Nginx (resolved to this host) the same way cd.yml does.
verify_public() {
  local scheme="$1" resolve attempt
  if [ "$scheme" = https ]; then resolve="$WEB_DOMAIN:443:127.0.0.1"; else resolve="$WEB_DOMAIN:80:127.0.0.1"; fi
  for attempt in $(seq 1 30); do
    if curl --noproxy '*' -fsS --resolve "$resolve" --max-time 10 "$scheme://$WEB_DOMAIN/health" >/dev/null; then
      echo "Public check OK via $scheme://$WEB_DOMAIN"
      return 0
    fi
    sleep 2
  done
  echo "Public check failed via $scheme://$WEB_DOMAIN" >&2
  return 1
}

# Keeps the images used by the two slot containers, removes other $IMAGE_REPO tags and dangling layers.
prune_old_images() {
  local keep="" id tag c full_id
  for c in "$CONTAINER_PREFIX-blue" "$CONTAINER_PREFIX-green"; do
    id="$(docker inspect -f '{{.Image}}' "$c" 2>/dev/null || true)"
    [ -n "$id" ] && keep="$keep $id"
  done
  docker images "$IMAGE_REPO" --format '{{.Repository}}:{{.Tag}} {{.ID}}' | while read -r tag id; do
    full_id="$(docker inspect -f '{{.Id}}' "$id" 2>/dev/null || true)"
    case " $keep " in
      *" $full_id "*) ;;
      *) echo "Removing old image $tag"; docker rmi "$tag" >/dev/null 2>&1 || true ;;
    esac
  done
  docker image prune -f >/dev/null 2>&1 || true
}

main() {
  cd "$DEPLOY_BASE_DIR"
  test -f .env

  local active_slot new_slot new_port app_image
  app_image="$(sed -n 's/^APP_IMAGE=//p' .env | tail -n 1)"
  if [ -z "$app_image" ] || ! docker image inspect "$app_image" >/dev/null 2>&1; then
    echo "Image ${app_image:-<APP_IMAGE missing in .env>} is not loaded on this server." >&2
    exit 1
  fi

  active_slot="$(detect_active_slot)"
  new_slot="$(other_slot "$active_slot")"
  new_port="$(slot_port "$new_slot")"
  echo "Active slot: ${active_slot:-none}. Deploying $app_image to: $new_slot (127.0.0.1:$new_port)"

  check_free_disk "$DEPLOY_BASE_DIR"

  # 1. Start the inactive slot from the loaded image. The active slot keeps serving.
  docker compose up -d --no-build --no-deps --force-recreate "app_$new_slot"

  # 2. Gate: the new slot must answer /health before anything public changes.
  if ! wait_for_health "$new_port" "app_$new_slot"; then
    docker compose logs --tail 150 "app_$new_slot" || true
    docker compose stop "app_$new_slot" >/dev/null 2>&1 || true
    echo "Deploy aborted; ${active_slot:-no} slot is still serving traffic." >&2
    exit 1
  fi

  # 3. Switch Nginx to the new slot (reload = no dropped connections), record the state.
  switch_nginx_to_port "$new_port"
  record_active_slot "$new_slot"

  # 4. Retire the old slot.
  retire_slot "$active_slot"

  # 5. Self-check through the public hostname, then tidy old images.
  verify_public "$nginx_mode"
  prune_old_images

  echo "PLS web frontend deployed: app_$new_slot on 127.0.0.1:$new_port ($nginx_mode://$WEB_DOMAIN)"
  echo "Previous slot: ${active_slot:-none} (stopped, available for rollback_testing.sh)"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
