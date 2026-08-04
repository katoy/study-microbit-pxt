// main.js - Shake & Shoot Invader (JavaScript)

const MAX_AMMO = 3;

function initGame() {
    return {
        playerX: 2,
        bullets: [],
        invaders: [],
        ammo: MAX_AMMO,
        score: 0,
        gameOver: false
    };
}

function drawGame(state, tick, display) {
    if (!display) return;
    display.clear();

    // 1. 敵の描画
    for (const inv of state.invaders) {
        const brightness = (tick % 2 === 0) ? 9 : 6;
        display.setPixel(inv[0], inv[1], brightness);
    }

    // 2. 弾の描画
    for (const b of state.bullets) {
        display.setPixel(b[0], b[1], 8);
    }

    // 3. 自機の描画
    display.setPixel(state.playerX, 4, 9);

    // 4. 残弾ゼロ時のリロード警告表示
    if (state.ammo === 0 && (tick % 2 === 1)) {
        display.setPixel(state.playerX, 4, 2);
    }
}

function isInList(item, list) {
    for (const x of list) {
        if (x[0] === item[0] && x[1] === item[1]) {
            return true;
        }
    }
    return false;
}

function updateGameStep(state, tick, inputs, stateMeta = { spawnTimer: 0 }, randomFn = Math.random) {
    if (state.gameOver) {
        return { state, stateMeta };
    }

    let { playerX, bullets, invaders, ammo, score, gameOver } = state;
    let spawnTimer = stateMeta.spawnTimer || 0;

    // リロード処理 (Shake)
    if (inputs.shaken) {
        ammo = MAX_AMMO;
        return {
            state: { playerX, bullets, invaders, ammo, score, gameOver },
            stateMeta: { spawnTimer, reloaded: true }
        };
    }

    // ボタン操作判定
    let aPressed = !!inputs.aPressed;
    let bPressed = !!inputs.bPressed;
    let abPressed = !!inputs.abPressed;

    if (aPressed && bPressed) {
        abPressed = true;
        aPressed = false;
        bPressed = false;
    }

    if (aPressed) {
        playerX = Math.max(0, playerX - 1);
    } else if (bPressed) {
        playerX = Math.min(4, playerX + 1);
    }

    if (abPressed) {
        if (ammo > 0) {
            bullets = [...bullets, [playerX, 3]];
            ammo -= 1;
        }
    }

    // 弾の移動
    const newBullets = [];
    for (const b of bullets) {
        const nextY = b[1] - 1;
        if (nextY >= 0) {
            newBullets.push([b[0], nextY]);
        }
    }
    bullets = newBullets;

    // 敵の移動 (2 tick ごと)
    if (tick % 2 === 0) {
        const newInvaders = [];
        for (const inv of invaders) {
            const nextY = inv[1] + 1;
            if (nextY > 4) {
                gameOver = true;
                break;
            } else {
                newInvaders.push([inv[0], nextY]);
            }
        }
        invaders = newInvaders;
    }

    if (gameOver) {
        return {
            state: { playerX, bullets, invaders, ammo, score, gameOver },
            stateMeta: { spawnTimer }
        };
    }

    // 敵の新規生成
    const spawnInterval = Math.max(2, 6 - Math.floor(score / 3));
    spawnTimer += 1;
    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        const invX = Math.floor(randomFn() * 5);
        const exists = invaders.some(inv => inv[0] === invX && inv[1] === 0);
        if (!exists) {
            invaders = [...invaders, [invX, 0]];
        }
    }

    // 弾と敵の当たり判定
    const bulletsToRemove = [];
    const invadersToRemove = [];

    for (const b of bullets) {
        for (const inv of invaders) {
            if (b[0] === inv[0] && b[1] === inv[1]) {
                bulletsToRemove.push(b);
                invadersToRemove.push(inv);
                score += 1;
                break;
            }
        }
    }

    bullets = bullets.filter(b => !isInList(b, bulletsToRemove));
    invaders = invaders.filter(inv => !isInList(inv, invadersToRemove));

    // 自機と敵の衝突判定
    for (const inv of invaders) {
        if (inv[0] === playerX && inv[1] === 4) {
            gameOver = true;
            break;
        }
    }

    return {
        state: { playerX, bullets, invaders, ammo, score, gameOver },
        stateMeta: { spawnTimer }
    };
}

function runGameLoop(device, controller, maxTicks = 1000) {
    device.display.scroll("INVADER");
    let state = initGame();
    let tick = 0;
    let stateMeta = { spawnTimer: 0 };

    while (!state.gameOver && tick < maxTicks) {
        const inputs = controller.readInputs();
        if (inputs.shaken) {
            device.display.show("YES");
            device.sleep(150);
        }

        const stepResult = updateGameStep(state, tick, inputs, stateMeta, controller.random || Math.random);
        state = stepResult.state;
        stateMeta = stepResult.stateMeta;

        if (state.gameOver) {
            break;
        }

        drawGame(state, tick, device.display);
        tick++;
        device.sleep(150);
    }

    device.display.show("SKULL");
    device.sleep(1000);
    device.display.scroll("SCORE:" + state.score);
    device.sleep(1000);

    return state;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MAX_AMMO,
        initGame,
        drawGame,
        isInList,
        updateGameStep,
        runGameLoop
    };
}
