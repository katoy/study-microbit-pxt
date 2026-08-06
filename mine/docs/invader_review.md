# インベーダーゲーム レビュー (`invader`)

ゲームロジックのテスト用 JavaScript ファイルと、MakeCode 移植向け JavaScript / TypeScript ファイルが混在しているプロジェクト、およびテスト環境のレビュー詳細です。

---

## 📋 プロジェクト構成
1. **`main.js`**:
   一般的なJavaScript環境（Node.jsなど）で動作し、モックデバイスを用いたユニットテストが可能な構造になっています。
2. **`main_makecode.js`**:
   `main.js` のロジックを micro:bit (MakeCode JS/TS) 用にアレンジし、`basic.forever` 等のAPIを用いて移植したものです。

---

## 📊 評価: **PASS** (完全互換 - 対処済み)

* **メインコード**: [`invader/main_makecode.js`](file:///Users/katoy/github/study-microbit-pxt/mine/invader/main_makecode.js)
* **ブロック互換性**: **100% 互換**。以前は 2次元配列（`bullets: number[][]` 等）や `Array.filter` などの高度な構文を使用しており、ブロック化した際に「グレーブロック」になってビジュアル編集ができませんでしたが、1次元配列への分離と `splice` による削除処理への書き換え（対処済み）により、すべてのコードがビジュアルブロックとして表現・編集可能になりました。

#### 🟩 対応後のコード (ブロック完全互換版)
1次元の `number[]` 配列で座標をXとYに分けて管理し、`splice`（削除）メソッドを使ってインデックス走査で敵と弾の衝突処理を行う、ブロック完全互換バージョンです。
```typescript
let MAX_AMMO = 3
let playerX = 2
let ammo = MAX_AMMO
let score = 0
let gameOver = false

// 1次元配列に分離して管理 (MakeCodeブロックと完全互換)
let bulletX: number[] = []
let bulletY: number[] = []
let invaderX: number[] = []
let invaderY: number[] = []

function initGame() {
    playerX = 2
    bulletX = []
    bulletY = []
    invaderX = []
    invaderY = []
    ammo = MAX_AMMO
    score = 0
    gameOver = false
}

// リロード処理 (Shake)
input.onGesture(Gesture.Shake, function () {
    ammo = MAX_AMMO
    basic.showIcon(IconNames.Yes)
    basic.pause(150)
})

function drawGame(tick: number) {
    basic.clearScreen()
    for (let i = 0; i < invaderX.length; i++) {
        led.plot(invaderX[i], invaderY[i])
    }
    for (let i = 0; i < bulletX.length; i++) {
        led.plot(bulletX[i], bulletY[i])
    }
    led.plot(playerX, 4)
    if (ammo === 0 && tick % 2 === 1) {
        led.unplot(playerX, 4)
    }
}

basic.forever(function () {
    basic.showString("INVADER")
    initGame()
    let tick = 0
    let spawnTimer = 0

    while (!gameOver) {
        let aPressed = input.buttonIsPressed(Button.A)
        let bPressed = input.buttonIsPressed(Button.B)
        let abPressed = input.buttonIsPressed(Button.AB)

        if (abPressed) {
            if (ammo > 0) {
                bulletX.push(playerX)
                bulletY.push(3)
                ammo -= 1
                basic.pause(100)
            }
        } else if (aPressed) {
            playerX = Math.max(0, playerX - 1)
            basic.pause(100)
        } else if (bPressed) {
            playerX = Math.min(4, playerX + 1)
            basic.pause(100)
        }

        // 弾の移動 (画面外に出た弾は削除)
        for (let i = bulletY.length - 1; i >= 0; i--) {
            bulletY[i] = bulletY[i] - 1
            if (bulletY[i] < 0) {
                bulletX.splice(i, 1)
                bulletY.splice(i, 1)
            }
        }

        // 敵の移動 (2 tick ごと。一番下まで到達したらゲームオーバー)
        if (tick % 2 === 0) {
            for (let i = invaderY.length - 1; i >= 0; i--) {
                invaderY[i] = invaderY[i] + 1
                if (invaderY[i] > 4) {
                    gameOver = true
                    break
                }
            }
        }

        if (gameOver) {
            break
        }

        // 敵の生成
        let spawnInterval = Math.max(2, 6 - Math.idiv(score, 3))
        spawnTimer += 1
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0
            let newX = randint(0, 4)
            let exists = false
            for (let i = 0; i < invaderX.length; i++) {
                if (invaderX[i] === newX && invaderY[i] === 0) {
                    exists = true
                    break
                }
            }
            if (!exists) {
                invaderX.push(newX)
                invaderY.push(0)
            }
        }

        // 当たり判定 (弾と敵の衝突判定 - 後ろから走査して安全に削除)
        for (let i = bulletX.length - 1; i >= 0; i--) {
            let hit = false
            for (let j = invaderX.length - 1; j >= 0; j--) {
                if (bulletX[i] === invaderX[j] && bulletY[i] === invaderY[j]) {
                    invaderX.splice(j, 1)
                    invaderY.splice(j, 1)
                    hit = true
                    score += 1
                    break
                }
            }
            if (hit) {
                bulletX.splice(i, 1)
                bulletY.splice(i, 1)
            }
        }

        // 自機と敵の衝突判定
        for (let i = 0; i < invaderX.length; i++) {
            if (invaderX[i] === playerX && invaderY[i] === 4) {
                gameOver = true
                break
            }
        }

        if (gameOver) {
            break
        }

        drawGame(tick)
        tick += 1
        basic.pause(150)
    }

    basic.showIcon(IconNames.Skull)
    basic.pause(1000)
    basic.showString("SCORE:" + score)
    basic.pause(1000)
})
```

---

## 🧪 テストコードのレビュー (`invader/tests/`)

### ① ユニットテスト (`main.test.js`)
* **ソース**: [`main.test.js`](file:///Users/katoy/github/study-microbit-pxt/mine/invader/tests/main.test.js)
* **評価**: **EXCELLENT** (軽量かつ高品質)
* **分析**: Node.js 標準の `node:test` および `node:assert/strict` を使用しており、サードパーティ製の重いテストランナーを使用せず極めて高速に動作します。
* **テストダブル**: 仮想の `MockDisplay` や `MockDevice` を定義し、ボタン押下（A/B/AB）、リロード（Shake）、弾と敵の衝突判定、最下段侵入時のゲームオーバー、描画タイミング（奇数/偶数 tick）など、すべてのゲームステップを完全にシミュレート・検証しています。

### ② シミュレータE2Eテスト (`makecode-sim.spec.js`)
* **ソース**: [`makecode-sim.spec.js`](file:///Users/katoy/github/study-microbit-pxt/mine/invader/tests/makecode-sim.spec.js)
* **評価**: **EXCELLENT**
* **分析**: Playwright を用いて Web 版 MakeCode エディタに `main_makecode.js` を流し込み、シミュレータ（iframe）を起動して自動的に A ボタン（左移動）、B ボタン（右移動）、および Shake（リロード）アクションを発火させ、挙動確認と最終状態のスクリーンショット撮影を行います。
* **検証結果**: 修正された `main_makecode.js` でも問題なく動作し、E2Eテストは **PASS** しています。
