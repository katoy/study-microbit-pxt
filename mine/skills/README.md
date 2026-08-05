# Micro:bit Skills

このフォルダでは、micro:bit の開発補助を行うための AI Agent 用スキル（Skill）を Git 管理しています。

## 目次

- [含まれるスキル](#含まれるスキル)
- [セットアップ手順（グローバル共有）](#セットアップ手順グローバル共有)
  - [実行方法](#実行方法)
  - [スクリプトの動作](#スクリプトの動作)
- [設定取り消し手順（アンセットアップ）](#設定取り消し手順アンセットアップ)
  - [実行方法](#実行方法-1)
  - [スクリプトの動作](#スクリプトの動作-1)
- [ライセンス](#ライセンス)

## 含まれるスキル

- [`microbit-block-reviewer`](microbit-block-reviewer/SKILL.md)
  - MakeCode micro:bit 用の Python / TypeScript コードをレビューし、MakeCode ブロック化への互換性・非対応構文・API差異の検出と最適化提案、および Playwright を用いた自動検証を行うスキル。
  - **起動プロンプト例**:
    - **簡素な例**: 「`main.py` がブロックに変換できるかレビューして」
    - **詳細な例**: 「`main.py` 内の MicroPython 構文や API（`time.sleep` 等）が MakeCode ブロックエディタと互換性があるかレビューし、非対応部分があれば MakeCode Python API にリファクタリングして」
- [`microbit-build-and-open`](microbit-build-and-open/SKILL.md)
  - ローカルで MakeCode/micro:bit プロジェクトをビルドし、生成された `.hex` ファイルを MakeCode デスクトップアプリまたは Playwright ブラウザ操作経由で開くスキル。
  - **起動プロンプト例**:
    - **簡素な例**: 「ビルドして MakeCode で開いて」
    - **詳細な例**: 「ローカルで `npx pxt build` を実行してプロジェクトをビルドし、生成された `built/binary.hex` を Playwright 経由でブラウザの MakeCode エディタにインポートして動作確認して」
- [`microbit-generate-blocks`](microbit-generate-blocks/SKILL.md)
  - Playwright ブラウザ自動操作を用いて MakeCode エディタへ TypeScript (`main.ts`) を注入・コンパイルし、IndexedDB よりビジュアルブロック定義 XML (`main.blocks`) を自動抽出・保存するスキル。
  - **起動プロンプト例**:
    - **簡素な例**: 「`main.ts` から `main.blocks` を生成して」
    - **詳細な例**: 「`main.ts` を編集したので Playwright で MakeCode に読み込ませ、IndexedDB からビジュアルブロック定義 XML (`main.blocks`) を抽出して保存し `pxt.json` を更新して」
- [`microbit-import-python`](microbit-import-python/SKILL.md)
  - ローカルの Python コード（`main.py` 等）を MakeCode エディタに読み込み、Monaco エディタへの注入およびブロック表現への相互変換を行うスキル。
  - **起動プロンプト例**:
    - **簡素な例**: 「`main.py` を MakeCode に取り込んで」
    - **詳細な例**: 「ローカルの `main.py` を MakeCode Web エディタの Monaco エディタに流し込み、エラーなくブロック表示に変換できるか確認して」
- [`microbit-sim-tester`](microbit-sim-tester/SKILL.md)
  - Playwright を活用し、MakeCode Web エディタ上のシミュレータでボタン（A/B/A+B）押下や加速度・傾きセンサー等のイベント発火をエミュレートし、5x5 LED マトリクスの表示結果をスクリーンショット撮影して検証するスキル。
  - **起動プロンプト例**:
    - **簡素な例**: 「シミュレータでボタン A を押して表示をテストして」
    - **詳細な例**: 「MakeCode シミュレータ上でボタン A や Shake（シェイク）イベントを発火させ、5x5 LED マトリクスに正しいグラフィックが表示されるかスクリーンショットを撮影して検証して」

---

## セットアップ手順（グローバル共有）

本フォルダのスキルを `agu` (Antigravity), `claude` (Claude Code), `codex` (Codex CLI) でグローバルに利用できるようにするため、各エージェントの設定ディレクトリへシンボリックリンクを作成します。

### 実行方法

本ディレクトリで以下のスクリプトを実行してください。

```bash
./setup.sh
```

### スクリプトの動作

`setup.sh` を実行すると、以下の各グローバルスキルディレクトリへ自動的にシンボリックリンクが作成されます。

- **Antigravity (agu)**: `~/.gemini/config/skills/`
- **Claude Code (claude)**: `~/.claude/skills/`
- **Codex (codex)**: `~/.codex/skills/`

---

## 設定取り消し手順（アンセットアップ）

作成したシンボリックリンクを削除し、グローバル設定を取り消すには以下のスクリプトを実行してください。

### 実行方法

本ディレクトリで以下のスクリプトを実行してください。

```bash
./cleanup.sh
```

### スクリプトの動作

`cleanup.sh` を実行すると、各エージェントのグローバルスキルディレクトリ内にある本リポジトリのスキルへのシンボリックリンクを自動的に検出・削除します。

---

## ライセンス

本プロジェクトは [MIT ライセンス](https://opensource.org/licenses/MIT) のもとで公開されています。

