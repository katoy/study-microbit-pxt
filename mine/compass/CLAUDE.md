# Compass プロジェクト固有設定

## プロジェクト概要

8方向方位磁石（コンパス）の基本実装版。取得した角度（0°〜359°）に応じて LED マトリクスに 8方向矢印を表示します。

## 固有情報

### 仕様
- **方向数**: 8方向（北・北東・東・南東・南・南西・西・北西）
- **判定方式**: 45° 刻み（360° ÷ 8）
- **表示パターン**: MakeCode 標準の `ArrowNames` を使用

### ロジック構成
- `src/compass.ts` - 8方向判定ロジック（条件分岐方式）
- `src/app.ts` - イベントループ（シンプル構成）

### テスト対象
- 全 8方向の分岐網羅（単位テスト：Vitest）
- E2E テスト（Playwright）
- カバレッジ 100%

### 自動同期
SSOT（Single Source of Truth）対応。`src/` が唯一の正。

```bash
npm run sync    # 手動同期（通常は不要、npm コマンド実行時に自動実行）
npm run build   # ビルド + 自動同期
npm run serve   # 開発サーバー + 自動同期
```

### スクリーンショット生成
```bash
npm run screenshots      # 代表画像の撮影（8方向）
npm run screenshots:gif  # 8方向回転デモ GIF の生成
```

## 開発時の注意

- `main.ts` は自動生成ファイル。直接編集しない。
- 常に `src/compass.ts` と `src/app.ts` を編集。
- テスト実行前に自動的に同期が走るため、`npm test` のみで OK。

## 参考
- ブロック互換性チェック: `/microbit-block-reviewer`
- ビルド & エディタ連携: `/microbit-build-and-open`
- シミュレータ検証: `/microbit-sim-tester`
