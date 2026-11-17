#!/usr/bin/env bash
# cx <model> <effort> <prompt-file> <out-file> [extra codex args, e.g. -i shot.png]
# Codex CLI routed through the Headroom compression proxy.
# Tiering: gpt-6-luna low|medium  -> lookups, distill, lint-style review
#          gpt-6.1-sol medium|high -> implementation, structured audits
#          gpt-6-astra high|xhigh  -> concept generation, adversarial critique
set -euo pipefail
model=$1; effort=$2; prompt=$3; out=${4:-/dev/stdout}; shift 4 || shift $#
export PATH="$HOME/.codex/plugins/.plugin-appserver:$PATH"
export HEADROOM_WRAP_PROXY_TIMEOUT=${HEADROOM_WRAP_PROXY_TIMEOUT:-150}  # 콜드 스타트가 45초를 넘는 경우가 있음
exec "$HOME/.ptools/Scripts/headroom.exe" wrap codex -- exec --skip-git-repo-check \
  -m "$model" -c model_reasoning_effort="\"$effort\"" -c web_search='"live"' \
  -C "$(git rev-parse --show-toplevel)" -o "$out" "$@" - < "$prompt"
