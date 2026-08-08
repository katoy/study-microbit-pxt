# CLAUDE.md - invader 開発ガイド

このドキュメントは、本プロジェクトにおけるビルド、テスト、および開発用のコマンドリファレンスと開発ガイドラインです。

---

## 🛠️ コマンドリファレンス

### 1. 依存関係のインストール

```bash
# 必要なライブラリ (Playwright 等) のインストール
npm install
```

### 2. テストの実行

```bash
# Node.js 標準テストランナーによるユニットテストの一括実行
npm run test
# または
npm test

# Jest ライクなテストカバレッジ計測テスト
npm run test:coverage

# Playwright E2E シミュレータテスト (スクリーンショットおよびデモ動画の自動キャプチャ)
npm run test:e2e
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
- **MakeCode ブロック互換性 (重要)**:
  - [`main_makecode.ts`](./main_makecode.ts) にコードを記述する際は、MakeCode ブロックエディタと双方向で正しく相互変換できる TypeScript 構文を使用してください。
  - ビジュアルブロックの「JavaScript（グレーのフォールバックブロック）」への崩れを防ぐため、以下の制約を遵守してください：
    - 配列の削除には `Array.splice` ではなく、MakeCode 独自の `Array.removeAt(index)` メソッドを使用してください。
    - ループを強制終了する `break` および `continue` ステートメントの使用は避けてください。
    - 操作レスポンスの向上とブロック構成の簡素化のため、同期的なポーリング `input.buttonIsPressed` の代わりに、非同期イベントハンドラ `input.onButtonPressed` を使用してください。
- **テストの実行**:
  - コード変更を行った場合は、必ず `npm test` および `npm run test:e2e` を実行して、すべてのユニットテストおよび E2E シミュレータテストが正常にパスすることを確認してください。
  - テスト結果から新しいスクリーンショットや動画ファイルが [`screenshots/`](./screenshots) フォルダへ自動保存・更新された場合は、適切に Git 管理（コミット）に含めてください。
