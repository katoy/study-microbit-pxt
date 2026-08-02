# microbit-build-and-open について

`microbit-build-and-open` は、MakeCode/micro:bit プロジェクトをローカルでビルドし、生成された `.hex` ファイルを MakeCode エディタに読み込ませるための手順および機能を指します。

## 主な手順

### 1. プロジェクトのローカルビルド
`pxt.json` が配置されているプロジェクトディレクトリで以下のコマンドを実行し、`built/binary.hex` を生成します。
```bash
npx pxt build
```

### 2. エディタへの読み込み
生成された `.hex` ファイルを、以下のいずれかの方法で MakeCode エディタに読み込ませます。

* **方法 A: MakeCode デスクトップアプリで開く（推奨）**
  デスクトップアプリがインストールされている場合、OSに応じたコマンドで直接開くことができます。
  * **macOS:**
    ```bash
    open -a "MakeCode for microbit" built/binary.hex
    ```
  * **Windows:**
    ```cmd
    start "" "built/binary.hex"
    ```

* **方法 B: Playwright を用いたブラウザへのインポートシミュレーション**
  デスクトップアプリが利用できない場合、Playwright を使用してブラウザ版エディタ（ `https://makecode.microbit.org/` ）を開き、以下のステップで `.hex` ファイルを読み込ませます。
  1. ブラウザエディタで「読み込む (Import)」ボタンをクリックする。
  2. 生成された `built/binary.hex` をファイル入力要素（ `<input type="file">` ）にアップロードする。
  3. 「つづける (Continue)」をクリックして、プロジェクトをロードする。
