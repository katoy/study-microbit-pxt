// Automatically generated. Do not edit directly.
const BOUNDS = [23, 68, 113, 158, 203, 248, 293];
const DIRECTIONS = [
    ArrowNames.North,
    ArrowNames.NorthEast,
    ArrowNames.East,
    ArrowNames.SouthEast,
    ArrowNames.South,
    ArrowNames.SouthWest,
    ArrowNames.West
];

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
