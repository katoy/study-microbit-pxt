# CLAUDE.md - hello-microbit 開発ガイド

このドキュメントは、本プロジェクトにおけるビルド、テスト、および開発用のコマンドリファレンスと開発ガイドラインです。

---

## 🛠️ コマンドリファレンス

### 1. 開発とビルド

MakeCode micro:bit (PXT) のビルドおよび開発用コマンドです。

```bash
# 依存関係のインストール
npm install

# PXT ターゲットの設定 (初回または切り替え時)
npx pxt target microbit

# ローカル開発サーバーの起動 (ブラウザでブロックエディタが起動)
npx pxt serve

# プロジェクトのビルド (.hex ファイルの生成)
npx pxt build
```

### 2. テストの実行

```bash
# すべてのテストを一括実行 (標準テスト -> ビルド -> E2E -> カバレッジ)
npm test
# または
./test.sh

# MakeCode PXT 標準ユニットテスト
npm run test:pxt

# Playwright E2E シミュレータテスト (スクリーンショットおよび動作動画の自動キャプチャ)
npm run test:e2e

# Jest コードカバレッジ計測テスト
npm run test:cov
```

### 3. RTK (Rust Token Killer) の利用

開発オペレーション時のトークン消費を最適化するための CLI プロキシツールコマンドです。

```bash
rtk gain              # トークン削減量の分析表示
rtk gain --history    # 削減履歴の確認
rtk discover          # Claude Code 履歴の最適化案分析
rtk proxy <command>   # フィルタリングなしのコマンド実行（デバッグ用）
```
※ `git status` などの標準コマンドは、Claude Code のフックにより自動的に `rtk git status` へ書き換えられ実行されます。

---

## 📋 開発ガイドライン

- **言語設定**: ユーザーとの対話および応答には、**常に日本語**を使用してください。
- **MakeCode ブロック互換性**: 
  - `main.ts` にコードを記述する際は、MakeCode ブロックエディタと双方向で正しく相互変換できる TypeScript 構文を使用してください（高度なジェネリクスやクラス定義などの非対応構文を避ける）。
- **テストの実行**:
  - コード変更を行った場合は、必ず `npm test` または `./test.sh` を実行して、すべてのユニットテスト、E2Eテスト、カバレッジ計測（C0/C1）が正常にパスすることを確認してください。
  - テスト結果から新しいスクリーンショットが `screenshots/` フォルダへ自動保存された場合は、適切に Git 管理（コミット）に含めてください。
