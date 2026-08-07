// Automatically generated. Do not edit directly.
const arrows_array = [
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
];

function getDirectionIndex(degrees: number): number {
    // 角度を [0, 360) の範囲に正規化（負の角度や 360度以上の値にも対応）
    const normalized = ((degrees % 360) + 360) % 360;
    // 22.5度刻みで四捨五入し、16等分したインデックスを求める
    return Math.round(normalized / 22.5) % 16;
}

basic.forever(function () {
    let degrees = input.compassHeading()
    let index = getDirectionIndex(degrees)
    arrows_array[index].showImage(0)
    basic.pause(100)
})
