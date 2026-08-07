# Compass-Array プロジェクト固有設定

## プロジェクト概要

8方向方位磁石の改良版。配列による判定アルゴリズムを使用し、SSOT（Single Source of Truth）パターンで自動同期されます。

## 固有情報

### 仕様
- **方向数**: 8方向（北・北東・東・南東・南・南西・西・北西）
- **判定方式**: 配列ループ探索による簡素化
- **境界配列**: `BOUNDS = [23, 68, 113, 158, 203, 248, 293]`
- **方向配列**: `DIRECTIONS` で北を指すように逆方向を割り当て

### ロジック構成
- `src/compass.ts` - 配列ベースの8方向判定ロジック
- `src/app.ts` - イベントループ（SSOT 結合対象）

### 特徴
- **配列探索**: 条件分岐より読みやすく、保守しやすい
- **角度正規化**: 負の角度や 360° 以上の値にも対応

### テスト対象
- 全 8方向の分岐網羅（単位テスト：Vitest）
- カバレッジ 100%

### 自動同期
SSOT 対応。ESLint 設定あり。

```bash
npm run lint    # ESLint チェック
npm run build   # ビルド + 自動同期
npm run serve   # 開発サーバー + 自動同期
```

## 開発時の注意

- **編集対象**: `src/compass.ts` のロジック、`src/app.ts` のエントリーコード
- **禁止**: `main.ts` は自動生成ファイル。直接編集しない。
- **同期タイミング**: npm コマンド実行時に自動実行（`pretest`, `prebuild`, `preserve` フック）

## ファイル構成

```
compass-array/
├── src/
│   ├── compass.ts    <-- 配列判定ロジック
│   └── app.ts        <-- エントリーコード
├── test/
│   └── unit/
│       └── compass.test.ts  <-- 100% カバレッジ
└── sync-config.json  <-- 同期スキル設定
```

## 参考
- 配列アルゴリズムの詳細: README.md の「判定アルゴリズム」セクション
- AI Agent スキル: `/microbit-block-reviewer`, `/microbit-sim-tester`
