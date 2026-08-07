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

---

## 4. compass16
### 📊 評価: **PASS** (完全互換 - 対処済み)

* **ソースコード**: [`compass16/main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/compass16/main.ts)
* **概要**: 16方位（22.5度刻み）の方位角を検知し、対応する矢印のImageオブジェクト（あらかじめ16個定義した配列）をLEDに表示します。
* **ブロック互換性**: **100% 互換**。以前はトップレベルで定数配列（`const arrows_array`）を宣言・初期化していたためグレーブロック化が懸念されていましたが、現在は配列変数を `let` 宣言にし、起動時（`onStart` ブロックにマッピングされるタイミング）に初期化するように修正されました。

#### 🟩 推奨される修正コード (ブロック完全互換版)
```typescript
let arrows_array: Image[] = []

// 起動時に配列を初期化
arrows_array = [
    // 0: N (北)
    images.arrowImage(ArrowNames.North),
    // 1: NNW (北北西)
    images.createImage(`
        # # # . .
        # # . . .
        # . # . .
        . . . # .
        . . . # .
    `),
    // 2: NW (北西)
    images.arrowImage(ArrowNames.NorthWest),
    // 3: WNW (西北西)
    images.createImage(`
        # # # . .
        # # . . .
        # . # . .
        . . . # #
        . . . . .
    `),
    // 4: W (西)
    images.arrowImage(ArrowNames.West),
    // 5: WSW (西南西)
    images.createImage(`
        . . . . .
        . . . # #
        # . # . .
        # # . . .
        # # # . .
    `),
    // 6: SW (南西)
    images.arrowImage(ArrowNames.SouthWest),
    // 7: SSW (南南西)
    images.createImage(`
        . . . # .
        . . . # .
        # . # . .
        # # . . .
        # # # . .
    `),
    // 8: S (南)
    images.arrowImage(ArrowNames.South),
    // 9: SSE (南南東)
    images.createImage(`
        . # . . .
        . # . . .
        . . # . #
        . . . # #
        . . # # #
    `),
    // 10: SE (南東)
    images.arrowImage(ArrowNames.SouthEast),
    // 11: ESE (東南東)
    images.createImage(`
        . . . . .
        # # . . .
        . . # . #
        . . . # #
        . . # # #
    `),
    // 12: E (東)
    images.arrowImage(ArrowNames.East),
    // 13: ENE (東北東)
    images.createImage(`
        . . # # #
        . . . # #
        . . # . #
        # # . . .
        . . . . .
    `),
    // 14: NE (北東)
    images.arrowImage(ArrowNames.NorthEast),
    // 15: NNE (北北東)
    images.createImage(`
        . . # # #
        . . . # #
        . . # . #
        . # . . .
        . # . . .
    `)
]

function getDirectionIndex(degrees: number): number {
    const normalized = ((degrees % 360) + 360) % 360;
    return Math.round(normalized / 22.5) % 16;
}

basic.forever(function () {
    let degrees = input.compassHeading()
    let index = getDirectionIndex(degrees)
    arrows_array[index].showImage(0)
    basic.pause(100)
})
```

---

## 5. compass-degit
### 📊 評価: **PASS** (完全互換 - 対処済み)

* **ソースコード**: [`compass-degit/main.ts`](file:///Users/katoy/github/study-microbit-pxt/mine/compass-degit/main.ts)
* **概要**: 北（0度）からの偏差角度（0〜180度）と回転方向（東回り `+` / 西回り `-`）を計算し、5x5 LED マトリクス上に「そろばん（Soroban）形式」のデジタル表現で数値を、左端の2列で符号（`+` は消灯、`-` は横棒）を表示します。
* **ブロック互換性**: **100% 互換**。以前はオブジェクトを返す関数や、多次元配列 `boolean[][]`・配列 `boolean[]` を扱う関数を使用していたためグレーブロック化していましたが、現在はそれらを廃止し、角度偏差を正負の数値（`-180`〜`+180`）で表現し、LEDマトリクスへの描画は `led.plot()` / `led.unplot()` で直接実行するようにリファクタリングしたことで、ブロック完全互換となりました。

#### 🟩 推奨される修正コード (ブロック完全互換版)
```typescript
/**
 * 0〜359の方位角から、北(0度)からの最小のずれの角度（-180〜+180）を計算します。
 * 東回りは正の値、西回りは負の値。
 */
function getHeadingOffset(heading: number): number {
    let normalized = ((heading % 360) + 360) % 360;
    if (normalized <= 180) {
        return Math.round(normalized);
    } else {
        return -Math.round(360 - normalized);
    }
}

/**
 * マイナス符号を表示（X=0, 1列目）
 */
function plotSign(isNegative: boolean): void {
    if (isNegative) {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                if (y === 2) {
                    led.plot(x, y);
                } else {
                    led.unplot(x, y);
                }
            }
        }
    } else {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 5; y++) {
                led.unplot(x, y);
            }
        }
    }
}

/**
 * 指定した列(X)に数値をそろばん形式で描画します。
 */
function plotSorobanColumn(x: number, digit: number): void {
    const val = Math.max(0, Math.min(9, Math.floor(digit)));
    
    // Y=0: 五玉 (5以上なら点灯)
    if (val >= 5) {
        led.plot(x, 0);
    } else {
        led.unplot(x, 0);
    }
    
    // Y=1..4: 一玉 (0..4)
    const ones = val % 5;
    for (let y = 1; y <= 4; y++) {
        if (ones >= y) {
            led.plot(x, y);
        } else {
            led.unplot(x, y);
        }
    }
}

basic.forever(function () {
    let heading = input.compassHeading()
    let offset = getHeadingOffset(heading)
    
    // 負数かどうかの判定
    let isNegative = offset < 0
    let absValue = Math.abs(offset)
    
    // 3桁の各数字を取得
    let hundreds = Math.floor(absValue / 100) % 10
    let tens = Math.floor((absValue % 100) / 10) % 10
    let ones = absValue % 10
    
    // LEDに直接描画
    plotSign(isNegative)
    plotSorobanColumn(2, hundreds)
    plotSorobanColumn(3, tens)
    plotSorobanColumn(4, ones)
    
    basic.pause(150)
})
```

