# Study MicroBit PXT Project Guidelines

このプロジェクトは micro:bit MakeCode (PXT) アプリケーションの開発リポジトリです。

## 言語・環境

- **メイン言語**: TypeScript
- **ランタイム**: Node.js (npm)
- **フレームワーク**: PXT (MakeCode TypeScript)
- **テストフレームワーク**: Vitest + Playwright

## ツール設定

### TypeScript

- **バージョン**: 5.0.0 以上
- **strictモード**: 有効（型安全性重視）
- **ESLint**: ruff ではなく eslint を使用

```bash
# TypeScript コンパイル確認
npm run build
```

### ESLint

各プロジェクトで ESLint を実行可能：

```bash
cd <project-dir>
npm run lint
```

### 型チェック

ビルド時に TypeScript コンパイルで型チェックが実行されます。

## ビルド手順

### 事前準備

```bash
# スキルのセットアップ（一度だけ実行）
cd skills
./setup.sh

# プロジェクトディレクトリでの準備
cd <project-dir>
npm install
```

### ビルド実行

```bash
cd <project-dir>
npm run build
# または
npm run sync && pxt build
```

**生成物**: `built/binary.hex` (マイクロビットに書き込み可能なファイル)

### 開発サーバー起動

ブロックエディタとの同期を行いながら開発：

```bash
cd <project-dir>
npm run serve
```

このコマンドは以下を実行します：
1. TypeScript → ブロック XML 自動生成
2. PXT 開発サーバー起動
3. ファイル変更時に自動同期

## テスト実行

### ユニットテスト実行

```bash
cd <project-dir>
npm run test:unit
```

Vitest を使用したユニットテスト。カバレッジ測定：

```bash
npm run coverage
```

### E2E テスト実行

```bash
cd <project-dir>
npm run test:e2e
```

Playwright を使用したエンドツーエンドテスト。

### 全テスト一括実行

```bash
cd <project-dir>
npm test
# または
npm run test
```

**注意**: 各テスト実行前に自動的に `npm run sync` が実行されます（`pretest` フック）。

## コーディング規約

### ファイル命名
- **TypeScript ファイル**: `camelCase.ts` (例: `compass.ts`, `main.ts`)
- **テストファイル**: `*.spec.ts` または `*.test.ts`

### 変数・関数名
- スネークケース推奨（例: `calculate_bearing`, `led_display`）
- グローバルスコープの定数: `UPPER_SNAKE_CASE`

### クラス名
- パスカルケース（例: `CompassCalculator`, `LEDDisplay`）

### コメント・docstring

```typescript
// 日本語コメント。ASCII文字と日本語の間に半角スペースを入れる
// 例: multiply(a, b) に 2 つの数値の積を number で返す

/**
 * LED に方向を 16 方向矢印で表示する
 * @param direction - 方向（0-15）
 * @returns 表示成功時は true
 */
function displayDirection16(direction: number): boolean {
  // 実装...
}
```

### 型ヒント
常に型ヒントを使用：

```typescript
// ✅ 良い
function calculateBearing(x: number, y: number): number {
  return Math.atan2(y, x) * (180 / Math.PI);
}

// ❌ 悪い
function calculateBearing(x, y) {
  return Math.atan2(y, x) * (180 / Math.PI);
}
```

## プロジェクト構成

各プロジェクト（`compass`, `compass-array`, `compass-degit`, `compass16`, `compass32` など）は以下の構成を持ちます：

```
compass*/
├── main.ts           - メインプログラム（自動生成される場合あり）
├── main.blocks       - ブロックエディタ同期ファイル
├── src/              - ビジネスロジック
│   ├── compass.ts    - 方向判定ロジック
│   └── ...
├── tests/            - テストコード
│   ├── unit/
│   │   ├── *.spec.ts
│   │   └── ...
│   ├── e2e/
│   │   ├── *.spec.ts
│   │   └── ...
│   └── conftest.ts
├── built/            - ビルド生成物
│   ├── binary.hex
│   └── ...
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── playwright.config.ts
├── vitest.config.ts (設定があれば)
└── README.md         - プロジェクト固有ドキュメント
```

## 単一情報源 (SSOT) と自動同期

一部のプロジェクト（`compass-array`, `compass-degit`, `compass32` など）は、`src/compass*.ts` を単一情報源とし、これから自動的に `main.ts` と `main.blocks` を生成します。

```bash
cd <project-dir>
npm run sync
```

このコマンドは `../skills/microbit-pxt-sync/scripts/sync-tool.ts` を実行し、以下を同期：
- `src/compass*.ts` → `main.ts` 自動生成
- `main.ts` → `main.blocks` 更新
- ビルド実行

**重要**: SSOT プロジェクトでは `main.ts` を直接編集しないでください。常に `src/` 配下のファイルを編集してください。

## クリーンアップ

プロジェクト全体をリセット：

```bash
./clean.sh
```

個別プロジェクトのクリーンアップ：

```bash
cd <project-dir>
rm -rf node_modules built coverage .vitest
npm install
```

## 参考資料

- [MakeCode Editor](https://makecode.microbit.org/)
- [PXT Documentation](https://makecode.microbit.org/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
