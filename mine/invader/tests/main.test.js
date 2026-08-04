// tests/main.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    MAX_AMMO,
    initGame,
    drawGame,
    isInList,
    updateGameStep,
    runGameLoop
} = require('../main.js');

class MockDisplay {
    constructor() {
        this.pixels = new Map();
        this.scrollHistory = [];
        this.showHistory = [];
    }

    clear() {
        this.pixels.clear();
    }

    setPixel(x, y, brightness) {
        this.pixels.set(`${x},${y}`, brightness);
    }

    scroll(text) {
        this.scrollHistory.push(text);
    }

    show(image) {
        this.showHistory.push(image);
    }
}

class MockDevice {
    constructor() {
        this.display = new MockDisplay();
        this.sleepHistory = [];
    }

    sleep(ms) {
        this.sleepHistory.push(ms);
    }
}

test('initGame should return initial game state', () => {
    const state = initGame();
    assert.equal(state.playerX, 2);
    assert.deepEqual(state.bullets, []);
    assert.deepEqual(state.invaders, []);
    assert.equal(state.ammo, MAX_AMMO);
    assert.equal(state.score, 0);
    assert.equal(state.gameOver, false);
});

test('drawGame should correctly plot elements on display', () => {
    // null display safety check
    drawGame(initGame(), 0, null);

    const display = new MockDisplay();
    const state = {
        playerX: 2,
        bullets: [[1, 2]],
        invaders: [[0, 0]],
        ammo: 3,
        score: 0,
        gameOver: false
    };

    // Even tick (tick % 2 === 0)
    drawGame(state, 0, display);
    assert.equal(display.pixels.get('0,0'), 9); // invader
    assert.equal(display.pixels.get('1,2'), 8); // bullet
    assert.equal(display.pixels.get('2,4'), 9); // player

    // Odd tick (tick % 2 === 1) with ammo = 0 (warning flash)
    display.clear();
    state.ammo = 0;
    drawGame(state, 1, display);
    assert.equal(display.pixels.get('0,0'), 6); // invader dimmed
    assert.equal(display.pixels.get('2,4'), 2); // player dimmed for warning

    // Even tick with ammo = 0 (no warning flash)
    display.clear();
    drawGame(state, 0, display);
    assert.equal(display.pixels.get('2,4'), 9);
});

test('isInList should identify coordinate existence', () => {
    const list = [[1, 2], [3, 4]];
    assert.equal(isInList([1, 2], list), true);
    assert.equal(isInList([2, 1], list), false);
});

test('updateGameStep - return early if already gameOver', () => {
    const state = { ...initGame(), gameOver: true };
    const result = updateGameStep(state, 0, {});
    assert.equal(result.state.gameOver, true);
});

test('updateGameStep - handle shaken input reload', () => {
    const state = { ...initGame(), ammo: 0 };
    const result = updateGameStep(state, 0, { shaken: true });
    assert.equal(result.state.ammo, MAX_AMMO);
    assert.equal(result.stateMeta.reloaded, true);
});

test('updateGameStep - player movement and shooting', () => {
    // Both A and B pressed -> AB pressed
    const state = initGame();
    let res = updateGameStep(state, 0, { aPressed: true, bPressed: true });
    assert.equal(res.state.bullets.length, 1);
    assert.equal(res.state.ammo, MAX_AMMO - 1);

    // Left movement and boundary (playerX = 0)
    state.playerX = 1;
    res = updateGameStep(state, 0, { aPressed: true });
    assert.equal(res.state.playerX, 0);

    res = updateGameStep(res.state, 0, { aPressed: true });
    assert.equal(res.state.playerX, 0); // clamped at 0

    // Right movement and boundary (playerX = 4)
    state.playerX = 3;
    res = updateGameStep(state, 0, { bPressed: true });
    assert.equal(res.state.playerX, 4);

    res = updateGameStep(res.state, 0, { bPressed: true });
    assert.equal(res.state.playerX, 4); // clamped at 4

    // Shoot when ammo is 0
    state.ammo = 0;
    res = updateGameStep(state, 0, { abPressed: true });
    assert.equal(res.state.bullets.length, 0);
});

test('updateGameStep - bullet movement and offscreen removal', () => {
    const state = {
        ...initGame(),
        bullets: [[2, 3], [1, 0]] // [1, 0] will move to [1, -1] and be removed
    };
    const res = updateGameStep(state, 0, {});
    assert.deepEqual(res.state.bullets, [[2, 2]]);
});

test('updateGameStep - invader movement and invasion gameOver', () => {
    // invader at y=4 moves to y=5 -> gameOver = true
    const state = {
        ...initGame(),
        invaders: [[0, 4]]
    };
    const res = updateGameStep(state, 0, {}); // tick 0 (even tick)
    assert.equal(res.state.gameOver, true);

    // invader at y=1 moves to y=2 on even tick, stays on odd tick
    const state2 = {
        ...initGame(),
        invaders: [[0, 1]]
    };
    const resOdd = updateGameStep(state2, 1, {}); // odd tick
    assert.deepEqual(resOdd.state.invaders, [[0, 1]]);
});

test('updateGameStep - enemy spawning (new vs existing conflict)', () => {
    // Spawning new enemy at x=2
    const state = {
        ...initGame(),
        score: 15 // spawnInterval = 2
    };

    // First spawn: randomFn returns 0.4 -> Math.floor(0.4 * 5) = 2
    const res1 = updateGameStep(state, 1, {}, { spawnTimer: 1 }, () => 0.4);
    assert.deepEqual(res1.state.invaders, [[2, 0]]);

    // Second spawn on odd tick where [2,0] already exists -> skip spawn
    const stateWithInv = {
        ...initGame(),
        score: 15,
        invaders: [[2, 0]]
    };
    const res2 = updateGameStep(stateWithInv, 1, {}, { spawnTimer: 1 }, () => 0.4);
    assert.deepEqual(res2.state.invaders, [[2, 0]]);
});

test('updateGameStep - bullet hit enemy and player collision', () => {
    // Bullet hit enemy at (1, 1)
    const state = {
        ...initGame(),
        bullets: [[1, 2]],
        invaders: [[1, 0]]
    };
    // Tick 0: bullet moves to (1, 1), enemy moves to (1, 1) -> hit!
    const resHit = updateGameStep(state, 0, {});
    assert.equal(resHit.state.score, 1);
    assert.deepEqual(resHit.state.bullets, []);
    assert.deepEqual(resHit.state.invaders, []);

    // Player collision with invader at (2, 3) moving to (2, 4)
    const stateCol = {
        ...initGame(),
        invaders: [[2, 3]]
    };
    const resCol = updateGameStep(stateCol, 0, {});
    assert.equal(resCol.state.gameOver, true);
});

test('runGameLoop - full execution flow', () => {
    const device = new MockDevice();
    let tickCount = 0;

    const controller = {
        readInputs: () => {
            tickCount++;
            if (tickCount === 1) {
                return { shaken: true };
            }
            if (tickCount === 2) {
                return { aPressed: true };
            }
            return {};
        },
        random: () => 0.1
    };

    // Run game loop until gameOver occurs (enemy reaches y=5)
    // We can inject enemy at (0, 3) on custom state, or let it spawn and move
    const finalState = runGameLoop(device, controller, 20);

    assert.equal(device.display.scrollHistory[0], "INVADER");
    assert.equal(device.display.showHistory.includes("YES"), true);
    assert.equal(device.display.showHistory.includes("SKULL"), true);
    assert.equal(device.display.scrollHistory[1].startsWith("SCORE:"), true);
});
