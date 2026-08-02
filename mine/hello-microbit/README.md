# hello-microbit

MakeCode / micro:bit (PXT) の TypeScript プロジェクトです。

## 機能概要

このプロジェクトには、以下の micro:bit の動作が実装されています：
- **起動時**: LED にハートアイコンを表示します。
- **Aボタン押下**: LED に笑顔アイコンを表示します。
- **Bボタン押下**: LED に悲しい顔アイコンを表示します。
- **A+Bボタン押下**: 「Hello!」とスクロール表示したあと、ハートアイコンに戻ります。
- **シェイク (Shake)**: 1〜6のランダムな数字（サイコロ）を1秒間表示したあと、画面を消去します。

---

## 開発環境のセットアップ

Node.js 環境がインストールされていることを前提とします。

```bash
# 依存パッケージのインストール
npm install

# PXT ターゲットの設定 (microbit)
npx pxt target microbit
```

---

## 開発と編集方法

PXTプロジェクトでは、`main.ts` を直接コードエディタで編集する以外に、MakeCode のブロックエディタを使用して `main.blocks` と `main.ts` を相互同期しながら開発することができます。

### ローカル開発サーバーの起動

以下のコマンドを実行すると開発サーバーが起動し、自動的にブラウザ上でブロックエディタが開きます。

```bash
npx pxt serve
```

ブラウザ上でブロックやコードを編集すると、ローカルファイルの [main.blocks](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.blocks) および [main.ts](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) が自動的にリアルタイムで同期・更新されます。

---

## ビルド

プロジェクトをコンパイルして micro:bit 用の `.hex` バイナリをビルドします（E2Eテストにも使用します）。

```bash
npx pxt build
```
ビルド結果は `built/binary.hex` に生成されます。

---

## テストの実行

このプロジェクトには3種類のテスト環境が統合されており、一括または個別に実行できます。

### 1. 全てのテストを一括実行（推奨）

以下のいずれかのコマンドを実行すると、「PXT標準テスト ➔ ビルド ➔ E2Eテスト ➔ カバレッジ計測」が順番に自動実行されます。

```bash
# npm スクリプト経由
npm test

# または、シェルスクリプト経由
./test.sh
```

### 2. 個別テストの実行

#### PXT 標準ユニットテスト
[tests/test.ts](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/tests/test.ts) に記述された PXT の挙動・ロジックテストを実行します。
```bash
npm run test:pxt
# または
npx pxt test
```

#### Playwright E2E シミュレータテスト
Playwright を使用してブラウザ上の MakeCode シミュレータにビルドした hex ファイルをロードし、実際にボタンクリックやシェイクなどのイベントを発生させて LED の点灯パターンの振る舞いを検証するテストです。
```bash
npm run test:e2e
# または
npx playwright test
```

#### Jest コードカバレッジ計測テスト
micro:bit の各 API をモックし、[main.ts](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) に対する C0/C1 カバレッジを Jest で測定します。
```bash
npm run test:cov
# または
npx jest
```
実行後、ターミナル上にカバレッジ結果が出力されるほか、`coverage/index.html` に詳細な **HTML カバレッジレポート** が出力されます。
