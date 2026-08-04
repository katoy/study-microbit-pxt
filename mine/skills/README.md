# Micro:bit Skills

このフォルダでは、micro:bit の開発補助を行うための AI Agent 用スキル（Skill）を Git 管理しています。

## 目次

- [含まれるスキル](#含まれるスキル)
- [セットアップ手順（グローバル共有）](#セットアップ手順グローバル共有)
  - [実行方法](#実行方法)
  - [スクリプトの動作](#スクリプトの動作)
- [ライセンス](#ライセンス)

## 含まれるスキル

- [`microbit-build-and-open`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-build-and-open/SKILL.md)
  - ローカルで MakeCode/micro:bit プロジェクトをビルドし、生成された `.hex` ファイルを MakeCode デスクトップアプリまたは Playwright ブラウザ操作経由で開くスキル。
- [`microbit-import-python`](file:///Users/katoy/github/study-microbit-pxt/mine/skills/microbit-import-python/SKILL.md)
  - ローカルの Python コード（`main.py` 等）を MakeCode エディタに読み込み、Monaco エディタへの注入およびブロック表現への相互変換を行うスキル。

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

## ライセンス

本プロジェクトは [MIT ライセンス](https://opensource.org/licenses/MIT) のもとで公開されています。

