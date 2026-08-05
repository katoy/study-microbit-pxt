// main_makecode.js - Shake & Shoot Invader (MakeCode JavaScript / TypeScript)

let MAX_AMMO = 3
let playerX = 2
let bullets: number[][] = []
let invaders: number[][] = []
let ammo = MAX_AMMO
let score = 0
let gameOver = false

function initGame() {
    playerX = 2
    bullets = []
    invaders = []
    ammo = MAX_AMMO
    score = 0
    gameOver = false
}

input.onGesture(Gesture.Shake, function () {
    ammo = MAX_AMMO
    basic.showIcon(IconNames.Yes)
    basic.pause(150)
})

function isInList(item: number[], list: number[][]): boolean {
    for (let x of list) {
        if (x[0] === item[0] && x[1] === item[1]) {
            return true
        }
    }
    return false
}

function drawGame(tick: number) {
    basic.clearScreen()
    // 1. 敵の描画
    for (let inv of invaders) {
        led.plot(inv[0], inv[1])
    }
    // 2. 弾の描画
    for (let b of bullets) {
        led.plot(b[0], b[1])
    }
    // 3. 自機の描画
    led.plot(playerX, 4)
    // 残弾ゼロ時の警告点滅
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
                bullets.push([playerX, 3])
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

        // 弾の移動
        let newBullets: number[][] = []
        for (let b of bullets) {
            let nextY = b[1] - 1
            if (nextY >= 0) {
                newBullets.push([b[0], nextY])
            }
        }
        bullets = newBullets

        // 敵の移動 (2 tick ごと)
        if (tick % 2 === 0) {
            let newInvaders: number[][] = []
            for (let inv of invaders) {
                let nextY = inv[1] + 1
                if (nextY > 4) {
                    gameOver = true
                    break
                } else {
                    newInvaders.push([inv[0], nextY])
                }
            }
            invaders = newInvaders
        }

        // 敵の生成
        let spawnInterval = Math.max(2, 6 - Math.idiv(score, 3))
        spawnTimer += 1
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0
            let invX = randint(0, 4)
            let exists = false
            for (let inv of invaders) {
                if (inv[0] === invX && inv[1] === 0) {
                    exists = true
                    break
                }
            }
            if (!exists) {
                invaders.push([invX, 0])
            }
        }

        // 当たり判定
        let remBullets: number[][] = []
        let remInvaders: number[][] = []
        for (let b of bullets) {
            for (let inv of invaders) {
                if (b[0] === inv[0] && b[1] === inv[1]) {
                    remBullets.push(b)
                    remInvaders.push(inv)
                    score += 1
                    break
                }
            }
        }

        bullets = bullets.filter(b => !isInList(b, remBullets))
        invaders = invaders.filter(inv => !isInList(inv, remInvaders))

        // 衝突判定
        for (let inv of invaders) {
            if (inv[0] === playerX && inv[1] === 4) {
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
