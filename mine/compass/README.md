# Compass (方位磁石)

micro:bit で動く方位磁石（コンパス）アプリケーションです。取得した角度（0°〜359°）に応じて、LED マトリクス上に 8 方向（北・北東・東・南東・南・南西・西・北西）の矢印アイコンを表示します。

## 📋 目次 (TOC)

- [操作デモ](#-操作デモ)
- [仕様・方向判定ロジック](#-仕様方向判定ロジック)
- [ディレクトリ構成](#-ディレクトリ構成)
- [開発・ビルド手順](#-開発ビルド手順)
  - [1. 依存パッケージのインストール](#1-依存パッケージのインストール)
  - [2. ローカル開発サーバーの起動](#2-ローカル開発サーバーの起動)
  - [3. プロジェクトのビルド](#3-プロジェクトのビルド)
  - [4. main.blocks の同期と注意点](#4-mainblocks-の同期と注意点)
- [テスト実行方法](#-テスト実行方法)
  - [1. ユニットテスト実行 (Vitest)](#1-ユニットテスト実行-vitest)
  - [2. E2E テスト実行 (Playwright)](#2-e2e-テスト実行-playwright)
- [カバレッジ計測結果表示方法](#-カバレッジ計測結果表示方法)
- [AI Agent スキルの活用プロンプト例](#-ai-agent-スキルの活用プロンプト例)

---

## 🎬 操作デモ

![操作デモ GIF](screenshots/demo.gif)

---

## 🧭 仕様・方向判定ロジック

`input.compassHeading()` で取得した角度（`0` 〜 `359`）から、以下の 8 方向の矢印を出力します。

| 角度範囲 (deg) | 方角 | 表示矢印アイコン (`ArrowNames`) |
|---|---|---|
| `338` <= deg < `23` (338°〜22°) | 北 (North) | `ArrowNames.North` |
| `23` <= deg < `68` (23°〜67°) | 北東 (NorthEast) | `ArrowNames.NorthEast` |
| `68` <= deg < `113` (68°〜112°) | 東 (East) | `ArrowNames.East` |
| `113` <= deg < `158` (113°〜157°) | 南東 (SouthEast) | `ArrowNames.SouthEast` |
| `158` <= deg < `203` (158°〜202°) | 南 (South) | `ArrowNames.South` |
| `203` <= deg < `248` (203°〜247°) | 南西 (SouthWest) | `ArrowNames.SouthWest` |
| `248` <= deg < `293` (248°〜292°) | 西 (West) | `ArrowNames.West` |
| `293` <= deg < `338` (293°〜337°) | 北西 (NorthWest) | `ArrowNames.NorthWest` |

---

## 📁 ディレクトリ構成

```text
compass/
├── main.ts              <-- メインプログラムコード (MakeCode PXT 用)
├── main.blocks          <-- ブロックエディタ用の同期ファイル (Blockly XML)
├── pxt.json             <-- PXT プロジェクト設定ファイル
├── src/
│   └── compass.ts       <-- 方位判定ロジック関数 (モジュール設計)
├── test/
│   ├── unit/
│   │   └── compass.test.ts  <-- Vitest ユニットテスト (カバレッジ 100%)
│   └── e2e/
│       └── compass.spec.ts  <-- Playwright E2E シミュレータテスト
├── screenshots/
│   └── demo.gif         <-- 操作デモ GIF
└── README.md            <-- 本ドキュメント
```

---

## 🛠️ 開発・ビルド手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. ローカル開発サーバーの起動

MakeCode のブロックエディタをローカルで起動して開発・確認を行えます。

```bash
npx pxt serve
```

### 3. プロジェクトのビルド

micro:bit 実機や MakeCode エディタへインポートするための `.hex` ファイルを作成します。

```bash
npx pxt build
```
ビルド完了後、`built/binary.hex` が生成されます。

### 4. main.blocks の同期と注意点

テキストエディタで `main.ts` を直接変更した場合、ローカルの `main.blocks` は自動同期されません。
`npx pxt serve` を実行中にしてブラウザで開くか、生成された `.hex` ファイルを MakeCode エディタに再インポートすることで `main.blocks` が最新化されます。

> [!IMPORTANT]
> ブロックエディタと双方向同期する場合は、MakeCode が標準サポートする文法で記述してください。

---

## 🧪 テスト実行方法

### 1. ユニットテスト実行 (Vitest)

全分岐網羅の単体テストをバックグラウンドで実行し、コードカバレッジを測定します。

```bash
npm test
```
または
```bash
npm run test:unit
```

### 2. E2E テスト実行 (Playwright)

Playwright を用いて MakeCode エディタ画面での要素読み込み・シミュレータ動作を検証します。

```bash
npm run test:e2e
```

---

## 📊 カバレッジ計測結果表示方法

### 1. ターミナルでの計測結果表示
`npm test`（または `npm run coverage`）を実行すると、ターミナル上に 100% カバレッジ結果が表示されます。

```text
 % Coverage report from v8
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |     100 |      100 |     100 |     100 |                   
 compass.ts |     100 |      100 |     100 |     100 |                   
------------|---------|----------|---------|---------|-------------------
```

### 2. HTML カバレッジレポートの表示
カバレッジの行ごとの詳細をブラウザで閲覧する場合、計測後に生成される `coverage/index.html` を開きます。

- **Mac で直接開く場合**:
  ```bash
  open coverage/index.html
  ```

---

## 🤖 AI Agent スキルの活用プロンプト例

AI エージェント (`claude`, `codex`, `antigravity` 等) を使用する場合、以下の指示プロンプトで自動動作確認・検証を行えます。

- **MakeCode ブロック互換性チェック**:
  > `main.ts` に MakeCode ブロックエディタで非対応となる構文やグレーブロックになる記述がないか `microbit-block-reviewer` スキルで検証してください。

- **MakeCode エディタ起動 & .hex インポート**:
  > `npx pxt build` を実行して `built/binary.hex` をビルドし、`microbit-build-and-open` スキルで Chrome の MakeCode エディタに読み込ませてください。

- **MakeCode シミュレータ動作検証 & キャプチャ**:
  > `microbit-sim-tester` スキルを使い、MakeCode シミュレータ上で方位磁石の動作確認を行い、LED の矢印表示結果をスクリーンショット撮影してください。
