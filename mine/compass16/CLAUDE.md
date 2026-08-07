# Compass16 プロジェクト固有設定

## プロジェクト概要

16方向方位磁石（高精度版）。22.5° 刻みで 360° を16方向に分割し、標準 8方向 + カスタム 8方向のハイブリッド矢印を表示します。

## 固有情報

### 仕様
- **方向数**: 16方向（22.5° 刻み）
- **表示方式**: ハイブリッド構成
  - **標準矢印** (8方向): MakeCode の `images.arrowImage` 使用（N, NW, W, SW, S, SE, E, NE）
  - **カスタム矢印** (8方向): `images.createImage` で独自描画（NNW, WNW, WSW, SSW, SSE, ESE, ENE, NNE）
- **判定アルゴリズム**: `Math.round(degrees / 22.5) % 16`

### ロジック構成
- `src/compass.ts` - 16方向判定ロジック & カスタム矢印パターン定義
- `src/app.ts` - イベントループ（SSOT 結合対象）

### 矢印パターン（配列インデックス）
```
index  0: N     (0°)     - 標準
index  1: NNW   (22.5°)  - カスタム
index  2: NW    (45°)    - 標準
index  3: WNW   (67.5°)  - カスタム
index  4: W     (90°)    - 標準
index  5: WSW   (112.5°) - カスタム
index  6: SW    (135°)   - 標準
index  7: SSW   (157.5°) - カスタム
index  8: S     (180°)   - 標準
index  9: SSE   (202.5°) - カスタム
index 10: SE    (225°)   - 標準
index 11: ESE   (247.5°) - カスタム
index 12: E     (270°)   - 標準
index 13: ENE   (292.5°) - カスタム
index 14: NE    (315°)   - 標準
index 15: NNE   (337.5°) - カスタム
```

### テスト対象
- 全 16方向の分岐網羅（単位テスト：Vitest）
- カバレッジ 100%

### 自動同期
SSOT 対応。ESLint 設定あり。

```bash
npm run lint    # ESLint チェック（カスタム画像定義の構文確認）
npm run build   # ビルド + 自動同期
npm run serve   # 開発サーバー + 自動同期
```

## 開発時の注意

- **編集対象**: `src/compass.ts` のカスタム矢印パターン定義
- **禁止**: `main.ts` は自動生成ファイル。直接編集しない。
- **カスタム画像**: `images.createImage` を使用。LED パターンが 5x5 格子に収まることを確認

## ファイル構成

```
compass16/
├── src/
│   ├── compass.ts    <-- 16方向判定 & カスタム矢印
│   └── app.ts        <-- イベントループ
├── test/
│   └── unit/
│       └── compass.test.ts  <-- 100% カバレッジ
└── sync-config.json  <-- 同期設定
```

## 参考
- 16方向の詳細: README.md の「仕様・16方向判定ロジック」セクション
- AI Agent スキル: `/microbit-block-reviewer`, `/microbit-sim-tester`
