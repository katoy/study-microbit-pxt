# micro:bit MakeCode ローカルビルド & インポート手順

本ディレクトリ（`mine`）は、micro:bit の MakeCode プロジェクトをローカル環境でビルドし、生成されたバイナリ（`.hex` ファイル）をエディタに読み込ませて開発・テストを行うための手順やツールをまとめたものです。また、ユニットテスト、E2Eテスト、テストカバレッジ測定などを含めた品質管理環境も統合されています。

## 目次

- [ディレクトリ構成](#ディレクトリ構成)
- [事前準備](#事前準備)
- [開発手順](#開発手順)
  - [1. ローカル開発サーバーの起動（ブロックエディタ同期）](#1-ローカル開発サーバーの起動ブロックエディタ同期)
  - [2. プロジェクトのビルド](#2-プロジェクトのビルド)
  - [3. エディタへのインポート](#3-エディタへのインポート)
  - [4. プログラム更新後の main.blocks の更新（同期）](#4-プログラム更新後の-mainblocks-の更新同期)
- [テストの実行](#テストの実行)
  - [1. 全てのテストを一括実行（推奨）](#1-全てのテストを一括実行推奨)
  - [2. 個別テストの実行](#2-個別テストの実行)
- [クリーンアップスクリプト (clean.sh)](#クリーンアップスクリプト-cleansh)
  - [対象ディレクトリ](#対象ディレクトリ)
  - [使用方法](#使用方法)
- [AIエージェントの活用 (microbit-build-and-open)](#aiエージェントの活用-microbit-build-and-open)
  - [エージェントへの指示プロンプト例](#エージェントへの指示プロンプト例)
  - [エージェントの内部動作プロセス](#エージェントの内部動作プロセス)
- [ライセンス](#ライセンス)

---

## ディレクトリ構成

`mine` ディレクトリは、以下のような構成になっています。

```text
mine/
├── hello-microbit/            <-- MakeCode プロジェクトディレクトリ
│   ├── main.ts                <-- メインプログラムコード (TypeScript)
│   ├── main.blocks            <-- ブロックエディタ用の同期ファイル
│   ├── built/                 <-- ビルド後に生成される成果物ディレクトリ (binary.hex など)
│   ├── tests/                 <-- テストコードが格納されているディレクトリ
│   │   ├── test.ts            <-- PXT用のユニットテスト
│   │   └── run-tests.spec.ts  <-- Playwright用のE2Eテスト
│   ├── test.sh                <-- テストを一括実行するシェルスクリプト
│   ├── package.json           <-- 依存パッケージ定義・npmスクリプト
│   ├── jest.config.js         <-- Jestの設定ファイル
│   ├── tsconfig.json          <-- TypeScriptの設定ファイル
│   ├── playwright.config.ts   <-- Playwrightの設定ファイル
│   └── README.md              <-- プロジェクト個別の詳細ドキュメント
├── clean.sh                   <-- プロジェクト全体を初期化するためのクリーンアップスクリプト
├── memo.txt                   <-- 開発メモ・参考リンク集
└── README.md                  <-- リポジトリ全体の案内ドキュメント（本ファイル）
```

## 事前準備

ローカル環境でのビルドやテストを実行する前に、以下の環境構築を行ってください。

1. **Node.js のインストール**
   Node.js (LTS推奨) がインストールされていることを確認してください。

2. **依存パッケージのインストール**
   プロジェクトディレクトリ（`hello-microbit`）に移動し、必要な npm パッケージをインストールします。
   ```bash
   cd hello-microbit
   npm install
   ```

3. **PXT ターゲットのセットアップ**
   PXT CLI を用いて micro:bit 向けのビルド環境をターゲットに指定します。
   ```bash
   npx pxt target microbit
   ```

---

## 開発手順

### 1. ローカル開発サーバーの起動（ブロックエディタ同期）
PXTプロジェクトでは、`main.ts` を直接テキストエディタで編集する以外に、MakeCode のビジュアルブロックエディタを使用して開発することができます。

以下のコマンドを実行すると開発サーバーが起動し、自動的にブラウザ上でブロックエディタが開きます。

```bash
cd hello-microbit
npx pxt serve
```

ブラウザ上でブロックやコードを編集すると、ローカルファイルの `main.blocks` および `main.ts` が自動的にリアルタイムで同期・更新されます。

### 2. プロジェクトのビルド
プロジェクトディレクトリで以下のコマンドを実行し、`built/binary.hex` を生成します。

```bash
cd hello-microbit
npx pxt build
```

### 3. エディタへのインポート
生成された `.hex` ファイルを、以下のいずれかの方法で MakeCode エディタにインポートします。

#### 方法 A: MakeCode デスクトップアプリで開く（推奨）
デスクトップアプリがインストールされている場合、OSに応じたコマンドで直接開くことができます。

* **macOS:**
  ```bash
  open -a "MakeCode for microbit" built/binary.hex
  ```
* **Windows:**
  ```cmd
  start "" "built/binary.hex"
  ```

#### 方法 B: Playwright を用いたブラウザへのインポートシミュレーション
デスクトップアプリが利用できない場合、Playwright を使用してブラウザ版エディタ（ `https://makecode.microbit.org/` ）を開き、自動インポートします。

1. ブラウザエディタで「読み込む (Import)」ボタンをクリック。
2. `built/binary.hex` をファイル入力要素（ `<input type="file">` ）にアップロード。
3. 「つづける (Continue)」をクリックしてプロジェクトをロード。

### 4. プログラム更新後の main.blocks の更新（同期）
テキストエディタで [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) などのプログラムファイルを直接編集・更新した場合、ローカルの [`main.blocks`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.blocks) ファイルは自動的には更新されません。[`main.blocks`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.blocks) を [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) の最新状態と同期させるには、以下のいずれかの方法を行います。

#### 方法 A: ローカル開発サーバー（`npx pxt serve`）を使用する（推奨）
1. `npx pxt serve` を実行してローカル開発サーバーを起動し、ブラウザでブロックエディタを開きます。
2. 開発サーバーが起動している状態で、テキストエディタで [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) を編集して保存します。
3. ブラウザ上のエディタが自動的にリロードされ、変更された [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) に基づいてブロックが再生成されます。これと同時に、ローカルの [`main.blocks`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.blocks) も自動的に更新されます。

#### 方法 B: ビルドした `.hex` ファイルを再インポートする
1. テキストエディタで [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) を編集後、`npx pxt build` を実行して `built/binary.hex` をビルドします。
2. 生成された `.hex` ファイルを MakeCode エディタ（デスクトップアプリまたはブラウザ版）に再度インポートします。
3. エディタがプロジェクトを読み込み、ブロック画面を表示したタイミングで [`main.blocks`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.blocks) が自動的に再生成されます。

> [!IMPORTANT]
> **ブロックへの逆変換（デコンパイル）における注意点**
> [`main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit/main.ts) でブロックエディタがサポートしていない複雑な TypeScript 構文（高度なクラス定義、ジェネリクス、一部のJavaScript組み込み関数など）を記述した場合、ブロックに逆変換する際に「グレーのJavaScriptブロック」として表示されるか、エラーが発生してブロックエディタで開けなくなることがあります。ブロックエディタと同期させたい場合は、MakeCodeが対応している標準的なAPIやシンプルな構文を使用してください。

---

## テストの実行

このプロジェクトには、3種類のテスト環境（PXT標準テスト、Playwright E2Eシミュレータテスト、Jestコードカバレッジテスト）が統合されています。

### 1. 全てのテストを一括実行（推奨）

以下のいずれかのコマンドを実行すると、「PXT標準テスト ➔ ビルド ➔ E2Eテスト ➔ カバレッジ計測」が順番に自動実行されます。

```bash
cd hello-microbit

# npm スクリプト経由
npm test

# または、シェルスクリプト経由
./test.sh
```

### 2. 個別テストの実行

#### PXT 標準ユニットテスト
`tests/test.ts` に記述された PXT の挙動・ロジックテストを実行します。
```bash
cd hello-microbit
npm run test:pxt
# または
npx pxt test
```

#### Playwright E2E シミュレータテスト
Playwright を使用してブラウザ上の MakeCode シミュレータにビルドした hex ファイルをロードし、実際にボタンクリックやシェイクなどのイベントを発生させて LED の点灯パターンの振る舞いを検証するテストです。
```bash
cd hello-microbit
npm run test:e2e
# または
npx playwright test
```

#### Jest コードカバレッジ計測テスト
micro:bit の各 API をモックし、`main.ts` に対する C0/C1 カバレッジを Jest で測定します。
```bash
cd hello-microbit
npm run test:cov
# または
npx jest
```
実行後、ターミナル上にカバレッジ結果が出力されるほか、`coverage/index.html` に詳細な **HTML カバレッジレポート** が出力されます。

---

## クリーンアップスクリプト (`clean.sh`)

プロジェクト内の不要なビルド生成物、キャッシュ、および依存パッケージを削除し、環境を初期化するためのスクリプトです。

### 対象ディレクトリ
実行すると、以下のディレクトリが削除されます：
* `node_modules/` (Node.js 依存パッケージ)
* `built/` (ビルド成果物)
* `pxt_modules/` (PXT 関連パッケージ)
* `.pxt/` (PXT キャッシュ)
* `yotta_modules/` / `yotta_targets/` (C++ビルド用の yotta 関連ディレクトリ)

### 使用方法
`mine` のルートディレクトリで実行します。

* **通常実行 (確認ダイアログあり):**
  ```bash
  ./clean.sh
  ```
  実行すると削除対象のディレクトリリストが表示され、確認を求められます。`y` または `yes` と入力すると削除されます。

* **自動実行 (確認なし):**
  確認プロンプトをスキップして、即時削除を実行する場合は `-y` または `--yes` を指定します。
  ```bash
  ./clean.sh -y
  ```

---

## AIエージェントの活用 (microbit-build-and-open)

`microbit-build-and-open` スキルを搭載した AI エージェント（Antigravity や Claude Code など）は、この手順全体を自律的に実行して動作確認を行うことができます。

### エージェントへの指示プロンプト例

AIエージェントに自動動作確認を依頼する際は、以下のように指示を送信します。

* **例1: ローカルのデスクトップアプリで起動確認**
  > 「`mine/hello-microbit` のコードを変更したので、ローカルでビルドして MakeCode デスクトップアプリで開いて動作確認をしてください。」
* **例2: ブラウザ版に自動アップロード＆スクリーンショット確認**
  > 「`hello-microbit` をビルドし、Playwright でブラウザ版の MakeCode エディタ（https://makecode.microbit.org/）を開いて、生成された hex ファイルをインポートしてください。インポートが成功したらスクリーンショットを撮って見せてください。」
* **例3: テストの一括実行とカバレッジ結果の確認**
  > 「`hello-microbit` プロジェクトをビルドし、`npm test`（または `test.sh`）を実行してテストがすべてパスすることを確認してください。また、カバレッジ結果を報告してください。」
* **例4: ビルドの検証のみ**
  > 「`hello-microbit` プロジェクトを一度クリーンアップしてから再ビルドし、`built/binary.hex` が正しく生成されるかチェックしてください。」

### エージェントの内部動作プロセス

AI エージェントは上記のプロンプトを受け取ると、以下のプロセスを実行します。

1. **プロジェクト確認**: `pxt.json` の存在と設定を確認。
2. **クリーン＆ビルド**: 必要に応じて `clean.sh` を実行後、`npx pxt build` を実行して `built/binary.hex` を生成。
3. **テスト実行（指示された場合）**: `npm test` または個別のテストコマンドを実行して結果を分析。
4. **エディタ読み込み**:
   - **デスクトップアプリ**: OSコマンドを利用してアプリを起動し `.hex` を読み込ませる。
   - **ブラウザ（Playwright）**: Playwright を用いて `https://makecode.microbit.org/` でインポート動作をシミュレートする。
5. **確認と報告**: ロードやテスト結果を確認し、必要に応じてスクリーンショットやカバレッジ結果をユーザーに報告。

---

## ライセンス

本プロジェクトは [MIT License](https://opensource.org/licenses/MIT) のもとで公開されています。
詳細は [LICENSE](../LICENSE) または本リポジトリのライセンス情報を参照してください。
