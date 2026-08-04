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

- [`microbit-block-reviewer`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-block-reviewer/SKILL.md)
  - MakeCode micro:bit 用の Python / TypeScript コードをレビューし、MakeCode ブロック化への互換性・非対応構文・API差異の検出と最適化提案、および Playwright を用いた自動検証を行うスキル。
- [`microbit-build-and-open`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-build-and-open/SKILL.md)
  - ローカルで MakeCode/micro:bit プロジェクトをビルドし、生成された `.hex` ファイルを MakeCode デスクトップアプリまたは Playwright ブラウザ操作経由で開くスキル。
- [`microbit-import-python`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-import-python/SKILL.md)
  - ローカルの Python コード（`main.py` 等）を MakeCode エディタに読み込み、Monaco エディタへの注入およびブロック表現への相互変換を行うスキル。
- [`microbit-sim-tester`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-sim-tester/SKILL.md)
  - Playwright を活用し、MakeCode Web エディタ上のシミュレータでボタン（A/B/A+B）押下や加速度・傾きセンサー等のイベントをエミュレートし、5x5 LED マトリクスの表示結果をスクリーンショット撮影して自動検証するスキル。

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

