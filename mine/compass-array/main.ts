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

