#!/usr/bin/env bash
# Rollback for PLS web testing frontend (run on the server).
#
#   rollback_testing.sh    switch Nginx back to the previous slot (the container stopped by the last
#                          deploy, still on its old image). No rebuild, takes a few seconds.
set -euo pipefail

DEPLOY_BASE_DIR="${DEPLOY_BASE_DIR:-/root/pls_web_testing/frontend}"

# shellcheck source=deploy_testing.sh
source "$DEPLOY_BASE_DIR/scripts/deploy_testing.sh"
cd "$DEPLOY_BASE_DIR"

active_slot="$(detect_active_slot)"
if [ -z "$active_slot" ]; then
  echo "No active slot recorded; nothing to roll back to." >&2
  exit 1
fi
target_slot="$(other_slot "$active_slot")"
target_port="$(slot_port "$target_slot")"

if ! docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_PREFIX-$target_slot"; then
  echo "Slot $target_slot has no container (first deploy). Redeploy an older commit instead (workflow_dispatch)." >&2
  exit 1
fi

echo "Active slot: $active_slot. Rolling back to: $target_slot (127.0.0.1:$target_port)"
docker compose start "app_$target_slot"
if ! wait_for_health "$target_port" "app_$target_slot"; then
  docker compose logs --tail 100 "app_$target_slot" || true
  docker compose stop "app_$target_slot" >/dev/null 2>&1 || true
  echo "Rollback aborted; $active_slot is still serving traffic." >&2
  exit 1
fi

switch_nginx_to_port "$target_port"
record_active_slot "$target_slot"
retire_slot "$active_slot"
verify_public "$nginx_mode"

echo "Rolled back: app_$target_slot is live on 127.0.0.1:$target_port; app_$active_slot stopped."
echo "Note: the next push to dev deploys the newest commit again; revert the commit if the old version must stay."
