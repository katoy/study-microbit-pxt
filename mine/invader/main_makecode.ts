let MAX_AMMO = 3
let playerX = 2
let ammo = MAX_AMMO
let score = 0
let gameOver = false
let inGame = false
let tick = 0
let spawnTimer = 0

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
    tick = 0
    spawnTimer = 0
}

// リロード処理 (Shake)
input.onGesture(Gesture.Shake, function () {
    ammo = MAX_AMMO
    basic.showIcon(IconNames.Yes)
    basic.pause(150)
})

// Aボタン移動イベント
input.onButtonPressed(Button.A, function () {
    if (inGame && !gameOver) {
        playerX = Math.max(0, playerX - 1)
    }
})

// Bボタン移動イベント
input.onButtonPressed(Button.B, function () {
    if (inGame && !gameOver) {
        playerX = Math.min(4, playerX + 1)
    }
})

// A+Bボタン射撃イベント
input.onButtonPressed(Button.AB, function () {
    if (inGame && !gameOver) {
        if (ammo > 0) {
            bulletX.push(playerX)
            bulletY.push(3)
            ammo -= 1
        }
    }
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

// ゲームの1ステップの更新ロジック (ループやbreakを排除)
function updateGame() {
    // 弾の移動 (画面外に出た弾は削除)
    for (let i = bulletY.length - 1; i >= 0; i--) {
        bulletY[i] = bulletY[i] - 1
        if (bulletY[i] < 0) {
            bulletX.removeAt(i)
            bulletY.removeAt(i)
        }
    }

    // 敵の移動 (2 tick ごと。一番下まで到達したらゲームオーバー)
    if (tick % 2 === 0) {
        for (let i = invaderY.length - 1; i >= 0; i--) {
            invaderY[i] = invaderY[i] + 1
            if (invaderY[i] > 4) {
                gameOver = true
            }
        }
    }

    if (gameOver) {
        return
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
            }
        }
        if (!exists) {
            invaderX.push(newX)
            invaderY.push(0)
        }
    }

    // 当たり判定 (弾と敵の衝突判定 - 後ろから走査して安全に削除。breakを排除)
    for (let i = bulletX.length - 1; i >= 0; i--) {
        let hit = false
        // 内側ループで敵を走査
        for (let j = invaderX.length - 1; j >= 0; j--) {
            // まだヒットしていない場合のみ判定
            if (!hit) {
                if (bulletX[i] === invaderX[j] && bulletY[i] === invaderY[j]) {
                    invaderX.removeAt(j)
                    invaderY.removeAt(j)
                    hit = true
                    score += 1
                }
            }
        }
        if (hit) {
            bulletX.removeAt(i)
            bulletY.removeAt(i)
        }
    }

    // 自機と敵の衝突判定
    for (let i = 0; i < invaderX.length; i++) {
        if (invaderX[i] === playerX && invaderY[i] === 4) {
            gameOver = true
        }
    }
}

basic.forever(function () {
    if (!inGame) {
        basic.showString("INVADER")
        initGame()
        inGame = true
    } else if (gameOver) {
        basic.showIcon(IconNames.Skull)
        basic.pause(1000)
        basic.showString("SCORE:" + score)
        basic.pause(1000)
        inGame = false
    } else {
        updateGame()
        if (!gameOver) {
            drawGame(tick)
            tick += 1
            basic.pause(150)
        }
    }
})

