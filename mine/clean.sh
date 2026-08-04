#!/bin/bash

# スクリプトのあるディレクトリを基準にする
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# 削除対象のディレクトリ名リスト
TARGET_NAMES=(
    "node_modules"
    "built"
    "pxt_modules"
    ".pxt"
    "yotta_modules"
    "yotta_targets"
    ".venv"
    "__pycache__"
    ".pytest_cache"
    ".ruff_cache"
    "coverage"
    "test-results"
    ".playwright-mcp"
)

echo "=== Cleanup Script ==="
echo "Searching in: $SCRIPT_DIR"
echo "Target directories: ${TARGET_NAMES[*]}"
echo "======================"

# 削除対象のパスを検索して配列に格納
FOUND_DIRS=()
for name in "${TARGET_NAMES[@]}"; do
    # find を使ってディレクトリを検索
    # -prune を使うことで、検出したディレクトリの配下をさらに走査するのを防ぐ
    while IFS= read -r -d '' dir; do
        if [ -d "$dir" ]; then
            FOUND_DIRS+=("$dir")
        fi
    done < <(find "$SCRIPT_DIR" -name "$name" -type d -prune -print0 2>/dev/null)
done

if [ ${#FOUND_DIRS[@]} -eq 0 ]; then
    echo "No target directories found."
    exit 0
fi

echo "Found the following directories to delete:"
for dir in "${FOUND_DIRS[@]}"; do
    # スクリプトのあるディレクトリからの相対パスで表示して見やすくする
    relative_path="${dir#$SCRIPT_DIR/}"
    echo "  - $relative_path"
done

# 引数チェック (-y または --yes があれば確認をスキップ)
SKIP_CONFIRM=false
if [ "$1" = "-y" ] || [ "$1" = "--yes" ]; then
    SKIP_CONFIRM=true
fi

if [ "$SKIP_CONFIRM" = false ]; then
    echo
    read -p "Are you sure you want to delete these directories? (y/N): " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            ;;
        *)
            echo "Cleanup cancelled."
            exit 0
            ;;
    esac
fi

echo "Deleting directories..."
for dir in "${FOUND_DIRS[@]}"; do
    echo "Removing: $dir"
    rm -rf "$dir"
done

echo "Cleanup completed successfully!"
