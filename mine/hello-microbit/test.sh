#!/bin/bash

# エラーが発生した時点でスクリプトを中断する
set -e

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")"

echo "=============================================="
echo "  Starting Micro:bit Project Test Suite"
echo "=============================================="

# 1. PXT 標準テストの実行
echo ""
echo "[Step 1/4] Running PXT Standard Tests..."
npx pxt test

# 2. プロジェクトのビルド (E2Eテストに必要な binary.hex の作成)
echo ""
echo "[Step 2/4] Building Micro:bit Binary (.hex)..."
npx pxt build

# 3. Playwright E2E テストの実行
echo ""
echo "[Step 3/4] Running Playwright E2E Simulator Tests..."
npx playwright test

# 4. Jest によるカバレッジ計測テストの実行
echo ""
echo "[Step 4/4] Running Jest Code Coverage Tests..."
npx jest

echo ""
echo "=============================================="
echo "  🎉 All tests completed successfully!"
echo "=============================================="
