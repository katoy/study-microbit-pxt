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

echo "Setting up skills from: $SCRIPT_DIR"

# 本ディレクトリ配下のスキルフォルダ（SKILL.md を含むディレクトリ）を検索
for skill_path in "$SCRIPT_DIR"/*; do
  if [ -d "$skill_path" ] && [ -f "$skill_path/SKILL.md" ]; then
    skill_name="$(basename "$skill_path")"
    echo "Found skill: $skill_name"

    for target_dir in "${TARGET_DIRS[@]}"; do
      mkdir -p "$target_dir"
      target_link="$target_dir/$skill_name"

      # 既存のリンクまたはディレクトリが存在し、リンク先が異なる場合やディレクトリの場合の処理
      if [ -e "$target_link" ] || [ -L "$target_link" ]; then
        current_target="$(readlink "$target_link" || true)"
        if [ "$current_target" = "$skill_path" ]; then
          echo "  [OK] Already linked in $target_dir"
          continue
        else
          echo "  [UPDATE] Replacing existing skill at $target_link"
          rm -rf "$target_link"
        fi
      fi

      ln -s "$skill_path" "$target_link"
      echo "  [LINKED] $target_link -> $skill_path"
    done
  fi
done

echo "Setup completed successfully."
