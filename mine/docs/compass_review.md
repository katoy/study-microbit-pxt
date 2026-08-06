# コンパス系プロジェクト レビュー (`compass`, `compass-array`, `compass32`)

コンパスセンサーの値を読み取ってLEDマトリクスに方位を表示する3つのプロジェクトのレビュー詳細です。

---

## 1. compass
### 📊 評価: **PASS** (完全互換)

* **ソースコード**: [`compass/main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/compass/main.ts)
* **概要**: 取得した角度（0〜359度）を 8方向（45度刻み）にマッピングし、矢印でLEDに描画します。
* **ブロック互換性**: 100% 互換。非対応構文はなく、ブロックエディタで綺麗に表示・編集できます。

#### 💡 コードの評価
シンプルな `if-else if` 分岐で `ArrowNames` を選択しており、初心者にもわかりやすいクリーンな構造です。

---

## 2. compass-array
### 📊 評価: **PASS** (完全互換 - 対処済み)

* **ソースコード**: [`compass-array/main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/compass-array/main.ts)
* **概要**: `compass` プロジェクトを配列とループを用いてリファクタリングし、分岐コードを簡素化したものです。
* **ブロック互換性**: **100% 互換**。以前はトップレベルで定数配列（`const BOUNDS`、`const DIRECTIONS`）を宣言・初期化していたためグレーブロック化が懸念されていましたが、現在は配列変数を `let` 宣言にし、起動時（`onStart` ブロックにマッピングされるタイミング）に初期化するように修正されました。

#### 🟩 対応後のコード (ブロック完全互換版)
```typescript
let DIRECTIONS: ArrowNames[] = []
let BOUNDS: number[] = []

// 起動時に配列を初期化（onStartブロックにマッピングされる）
DIRECTIONS = [
    ArrowNames.North,
    ArrowNames.NorthEast,
    ArrowNames.East,
    ArrowNames.SouthEast,
    ArrowNames.South,
    ArrowNames.SouthWest,
    ArrowNames.West
]
BOUNDS = [23, 68, 113, 158, 203, 248, 293]

function getDirection(degrees: number): ArrowNames {
    if (degrees >= 338) {
        return ArrowNames.North;
    }
    for (let i = 0; i < BOUNDS.length; i++) {
        if (degrees < BOUNDS[i]) {
            return DIRECTIONS[i];
        }
    }
    return ArrowNames.NorthWest;
}

basic.forever(function () {
    let degrees = input.compassHeading()
    basic.showArrow(getDirection(degrees))
})
```

---

## 3. compass32
### 📊 評価: **PASS** (ただしブロック表示上の課題あり)

* **ソースコード**: [`compass32/main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/compass32/main.ts)
* **概要**: 32方位（11.25度刻み）の細かな角度検知を行い、LEDの輝度制御（`led.plotBrightness`）を利用して、コンパスの針（明るさグラデーションを持つライン）を描画します。
* **ブロック互換性**: 動作上の互換性はありますが、**ビジュアル表示上の問題**があります。32個の `if-else if` 条件分岐があるため、ブロックに変換した際にワークスペースが極めて縦長になり、ブロックエディタ上での視覚的な編集は困難です。また、1行に5つの `led.plotBrightness` がセミコロン区切りで記述されているため、これらも大量の縦並びブロックに展開されます。

#### 💡 コードの評価とアドバイス
* **メリット**: 非常に滑らかな表現ができており、グラデーションによるラインの視覚効果は素晴らしいです。
* **推奨**: このプロジェクトはブロックエディタでの編集を想定せず、**TypeScript テキストエディタ専用コード** として運用するのが現実的です。
* もしブロック化を最優先する場合は、`compass-array` のように方位データを配列（1次元）で持たせ、ループで順次 `led.plotBrightness` する実装が望ましいですが、32方位分のピクセル座標＋明るさデータを1次元配列だけで管理しようとするとコードが難解になるため、現状の `if-else` による実装は妥当なトレードオフと言えます。
