#!/bin/bash
set -euo pipefail

# スクリプトが存在するディレクトリを絶対パスで取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# リンク先の各エージェントのグローバルスキル用フォルダ
TARGET_DIRS=(
  "$HOME/.gemini/config/skills"
  "$HOME/.claude/skills"
  "$HOME/.codex/skills"
)

echo "Cleaning up skills managed by: $SCRIPT_DIR"

# 本ディレクトリ配下のスキルフォルダ（SKILL.md を含むディレクトリ）を検索
for skill_path in "$SCRIPT_DIR"/*; do
  if [ -d "$skill_path" ] && [ -f "$skill_path/SKILL.md" ]; then
    skill_name="$(basename "$skill_path")"
    echo "Found skill: $skill_name"

    for target_dir in "${TARGET_DIRS[@]}"; do
      target_link="$target_dir/$skill_name"

      if [ -L "$target_link" ] || [ -e "$target_link" ]; then
        current_target="$(readlink "$target_link" || true)"
        if [ "$current_target" = "$skill_path" ]; then
          rm -rf "$target_link"
          echo "  [REMOVED] $target_link"
        else
          echo "  [SKIP] $target_link points to different target ($current_target)"
        fi
      else
        echo "  [NOT FOUND] Not present in $target_dir"
      fi
    done
  fi
done

echo "Cleanup completed successfully."
