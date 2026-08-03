# hello-microbit-python

MakeCodeプロジェクト `hello-microbit` の動作を micro:bit 用の **MicroPython** で再実装したプロジェクトです。

## 機能概要

[`hello-microbit`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit) と同様に、以下の動作が実装されています：
- **起動時**: LED にハートアイコンを表示します。
- **Aボタン押下**: LED に笑顔アイコンを表示します。
- **Bボタン押下**: LED に悲しい顔アイコンを表示します。
- **A+Bボタン押下**: 「Hello!」とスクロール表示したあと、ハートアイコンに戻ります。
- **シェイク (Shake)**: 1〜6のランダムな数字（サイコロ）を1秒間表示したあと、画面を消去します。

## ファイル構成

- [`main.py`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit-python/main.py): メインプログラムコード (MicroPython)

## 動作確認・書き込み方法

MicroPython コードを micro:bit に書き込んで動かすには、以下のいずれかの方法を使用します。

### 方法 A: Web版 micro:bit Python エディタを使用する (推奨)

1. ブラウザで [micro:bit Python Editor](https://python.microbit.org/) を開きます。
2. [`main.py`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit-python/main.py) のコードをコピーして、エディタに貼り付けます。
3. micro:bit を USB ケーブルでコンピュータに接続します。
4. エディタ画面の **「Send to micro:bit」**（または「ダウンロード」）ボタンをクリックして、プログラムを書き込みます。

### 方法 B: Mu エディタを使用する (オフライン開発用)

1. [Mu Editor](https://codewith.mu/) をダウンロードしてインストールします。
2. モード選択で **「BBC micro:bit」** を選択します。
3. [`main.py`](file:///Users/katoy/github/study-microbit-pxt/mine/hello-microbit-python/main.py) を開き、**「Flash」** ボタンをクリックして micro:bit に書き込みます。
